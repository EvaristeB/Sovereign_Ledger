import { ResourceType, Empire } from '../types';

export interface FuturesContract {
  id: string;
  buyerId: string;
  sellerId: string;
  resource: ResourceType;
  quantity: number;
  lockPrice: number; // Prix fixé maintenant pour livraison future
  deliveryDate: number; // Cycle de livraison
  status: 'active' | 'expired' | 'settled';
  createdAt: number;
  settlementPrice?: number; // Prix réel à livraison
}

export interface SpeculativePosition {
  id: string;
  empireId: string;
  resource: ResourceType;
  type: 'long' | 'short'; // Pari à la hausse ou à la baisse
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  leverage: number; // 1x, 2x, 5x risque
  status: 'open' | 'closed';
  profit?: number;
  createdAt: number;
}

/**
 * Futures Market System
 * Permet aux joueurs de parier sur les prix futurs
 * Ajouute de la volatilité contôlée au marché
 */
export class FuturesSystem {
  private contracts: Map<string, FuturesContract> = new Map();
  private positions: Map<string, SpeculativePosition> = new Map();
  private contractIdCounter = 0;
  private positionIdCounter = 0;

  /**
   * Créer un contrat à terme (vendeur promise une livraison)
   */
  public createFuturesContract(
    sellerId: string,
    resource: ResourceType,
    quantity: number,
    lockPrice: number,
    deliveryInCycles: number
  ): FuturesContract {
    const contract: FuturesContract = {
      id: `fut_${this.contractIdCounter++}_${Date.now()}`,
      buyerId: '', // Not assigned yet
      sellerId,
      resource,
      quantity,
      lockPrice,
      deliveryDate: Date.now() + deliveryInCycles * 1000,
      status: 'active',
      createdAt: Date.now(),
    };

    this.contracts.set(contract.id, contract);
    return contract;
  }

  /**
   * Acheter un contrat futur (pari sur le prix)
   */
  public buyFuturesContract(
    buyerId: string,
    contractId: string,
    empire: Empire
  ): { success: boolean; cost: number; error?: string; contract?: FuturesContract } {
    const contract = this.contracts.get(contractId);
    if (!contract) {
      return { success: false, cost: 0, error: 'Contrat introuvable' };
    }

    if (contract.buyerId) {
      return { success: false, cost: 0, error: 'Contrat déjà acheté' };
    }

    const cost = contract.quantity * contract.lockPrice;
    if (empire.treasury < cost) {
      return { success: false, cost, error: 'Trésorier insuffisant' };
    }

    contract.buyerId = buyerId;
    empire.treasury -= cost;

    return { success: true, cost, contract };
  }

  /**
   * Ouvrir une position spéculative
   * Long = pari à la hausse, Short = pari à la baisse
   */
  public openSpeculativePosition(
    empireId: string,
    resource: ResourceType,
    type: 'long' | 'short',
    quantity: number,
    currentPrice: number,
    leverage: number = 1,
    empire?: Empire
  ): { success: boolean; position?: SpeculativePosition; cost?: number; error?: string } {
    // Vérifier le levier (max 5x)
    if (leverage > 5 || leverage < 1) {
      return { success: false, error: 'Levier invalide (1x-5x)' };
    }

    // Coût = quantité × prix × levier / 10 (collateral requis)
    const requiredCapital = (quantity * currentPrice * leverage) / 10;

    if (empire && empire.treasury < requiredCapital) {
      return { success: false, error: 'Capital insuffisant pour cette position' };
    }

    const position: SpeculativePosition = {
      id: `pos_${this.positionIdCounter++}_${Date.now()}`,
      empireId,
      resource,
      type,
      quantity,
      entryPrice: currentPrice,
      leverage,
      status: 'open',
      createdAt: Date.now(),
    };

    this.positions.set(position.id, position);

    if (empire) {
      empire.treasury -= requiredCapital;
    }

    return { success: true, position, cost: requiredCapital };
  }

  /**
   * Fermer une position et réaliser le profit/loss
   */
  public closePosition(
    positionId: string,
    currentPrice: number,
    empire: Empire
  ): { success: boolean; profit: number; pnl: number; error?: string } {
    const position = this.positions.get(positionId);
    if (!position) {
      return { success: false, profit: 0, pnl: 0, error: 'Position introuvable' };
    }

    if (position.status === 'closed') {
      return { success: false, profit: 0, pnl: 0, error: 'Position déjà fermée' };
    }

    let pnl: number;
    if (position.type === 'long') {
      // Profit si prix monte
      pnl = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;
    } else {
      // Profit si prix descend
      pnl = ((position.entryPrice - currentPrice) / position.entryPrice) * 100;
    }

    // Profit final = PnL × quantité × prix d'entrée × levier / 100
    const profit = (pnl / 100) * position.quantity * position.entryPrice * position.leverage;

    position.exitPrice = currentPrice;
    position.status = 'closed';
    position.profit = profit;

    // Retourner les collaterals + profit/loss
    const requiredCapital = (position.quantity * position.entryPrice * position.leverage) / 10;
    empire.treasury += requiredCapital + profit;

    return { success: true, profit, pnl };
  }

  /**
   * Régler les contrats à terme quand la date arrive
   */
  public settleExpiredContracts(currentPrices: Map<ResourceType, number>): FuturesContract[] {
    const settled: FuturesContract[] = [];

    for (const contract of this.contracts.values()) {
      if (contract.status === 'active' && Date.now() >= contract.deliveryDate) {
        contract.settlementPrice = currentPrices.get(contract.resource) || contract.lockPrice;
        contract.status = 'settled';
        settled.push(contract);
      }
    }

    return settled;
  }

  /**
   * Calculer le P&L pour une position
   */
  public calculateUnrealizedPnL(
    positionId: string,
    currentPrice: number
  ): { pnl: number; unrealizedProfit: number } {
    const position = this.positions.get(positionId);
    if (!position) {
      return { pnl: 0, unrealizedProfit: 0 };
    }

    let pnl: number;
    if (position.type === 'long') {
      pnl = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;
    } else {
      pnl = ((position.entryPrice - currentPrice) / position.entryPrice) * 100;
    }

    const unrealizedProfit = (pnl / 100) * position.quantity * position.entryPrice * position.leverage;

    return { pnl, unrealizedProfit };
  }

  /**
   * Récupérer tous les contrats disponibles
   */
  public getAvailableContracts(): FuturesContract[] {
    return Array.from(this.contracts.values()).filter(c => !c.buyerId && c.status === 'active');
  }

  /**
   * Récupérer les positions d'un empire
   */
  public getEmpirePositions(empireId: string): SpeculativePosition[] {
    return Array.from(this.positions.values()).filter(
      p => p.empireId === empireId
    );
  }

  /**
   * Récupérer les contrats d'un empire
   */
  public getEmpireContracts(empireId: string): FuturesContract[] {
    return Array.from(this.contracts.values()).filter(
      c => c.buyerId === empireId || c.sellerId === empireId
    );
  }

  /**
   * Analyser l'intérêt ouvert (total positions)
   */
  public getOpenInterest(resource: ResourceType): {
    longVolume: number;
    shortVolume: number;
    netFlow: number;
  } {
    let longVolume = 0;
    let shortVolume = 0;

    for (const position of this.positions.values()) {
      if (position.resource === resource && position.status === 'open') {
        if (position.type === 'long') {
          longVolume += position.quantity;
        } else {
          shortVolume += position.quantity;
        }
      }
    }

    return {
      longVolume,
      shortVolume,
      netFlow: longVolume - shortVolume,
    };
  }
}
