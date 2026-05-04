import { GameEvent, ResourceType } from '../types';
import { MarketSystem } from './MarketSystem';

export class EventSystem {
  private events: GameEvent[] = [];
  private eventHistory: GameEvent[] = [];
  private eventIdCounter = 0;

  /**
   * Generate market crash event
   */
  public generateMarketCrash(
    resource: ResourceType,
    market: MarketSystem,
    severity: 'minor' | 'moderate' | 'severe',
    affectedEmpires: string[] = []
  ): GameEvent {
    const currentPrice = market.getMarketPrice(resource);
    const crashPercentage = severity === 'minor' ? 20 : severity === 'moderate' ? 50 : 80;

    const event: GameEvent = {
      id: `crash_${this.eventIdCounter++}_${Date.now()}`,
      type: 'market_crash',
      timestamp: Date.now(),
      affectedEmpires,
      data: {
        resource,
        priceDropPercentage: crashPercentage,
        originalPrice: currentPrice.price,
      },
    };

    this.events.push(event);
    this.eventHistory.push(event);
    return event;
  }

  /**
   * Generate resource shortage event
   */
  public generateShortage(resource: ResourceType, sector: string): GameEvent {
    const event: GameEvent = {
      id: `shortage_${Date.now()}`,
      type: 'shortage',
      timestamp: Date.now(),
      affectedEmpires: [],
      data: {
        resource,
        sector,
        priceIncrease: 100 + Math.random() * 200,
      },
    };

    this.events.push(event);
    this.eventHistory.push(event);
    return event;
  }

  /**
   * Generate surplus event
   */
  public generateSurplus(resource: ResourceType, quantity: number): GameEvent {
    const event: GameEvent = {
      id: `surplus_${Date.now()}`,
      type: 'surplus',
      timestamp: Date.now(),
      affectedEmpires: [],
      data: {
        resource,
        quantity,
        priceDecrease: 30 + Math.random() * 50,
      },
    };

    this.events.push(event);
    this.eventHistory.push(event);
    return event;
  }

  /**
   * Generate NPC invasion event
   */
  public generateInvasion(
    locationId: string,
    invasionForce: number,
    affectedEmpires: string[]
  ): GameEvent {
    const event: GameEvent = {
      id: `invasion_${Date.now()}`,
      type: 'invasion',
      timestamp: Date.now(),
      affectedEmpires,
      data: {
        location: locationId,
        force: invasionForce,
        threat: 'npc',
      },
    };

    this.events.push(event);
    this.eventHistory.push(event);
    return event;
  }

  /**
   * Generate worker revolt event
   */
  public generateWorkerRevolt(
    colonyId: string,
    empireId: string,
    reason: string
  ): GameEvent {
    const event: GameEvent = {
      id: `revolt_${Date.now()}`,
      type: 'revolt',
      timestamp: Date.now(),
      affectedEmpires: [empireId],
      data: {
        colony: colonyId,
        reason,
        productionStop: 0.5, // 50% production loss
      },
    };

    this.events.push(event);
    this.eventHistory.push(event);
    return event;
  }

  /**
   * Generate war declaration
   */
  public generateWarDeclaration(
    aggressor: string,
    defender: string,
    cause: string
  ): GameEvent {
    const event: GameEvent = {
      id: `war_${Date.now()}`,
      type: 'war_declared',
      timestamp: Date.now(),
      affectedEmpires: [aggressor, defender],
      data: {
        aggressor,
        defender,
        cause,
      },
    };

    this.events.push(event);
    this.eventHistory.push(event);
    return event;
  }

  /**
   * Get current active events
   */
  public getActiveEvents(): GameEvent[] {
    return this.events.filter(e => {
      // Events active for 100 cycles
      return Date.now() - e.timestamp < 100 * 1000;
    });
  }

  /**
   * Process event effects
   */
  public processEventEffects(event: GameEvent): Record<string, unknown> {
    const effects: Record<string, unknown> = {};

    switch (event.type) {
      case 'market_crash':
        effects['priceReduction'] = event.data['priceDropPercentage'];
        break;
      case 'shortage':
        effects['priceIncrease'] = event.data['priceIncrease'];
        break;
      case 'surplus':
        effects['priceDecrease'] = event.data['priceDecrease'];
        break;
      case 'invasion':
        effects['militaryThreat'] = event.data['force'];
        break;
      case 'revolt':
        effects['productionLoss'] = event.data['productionStop'];
        break;
      case 'war_declared':
        effects['warCost'] = 1000; // Per cycle
        break;
    }

    return effects;
  }

  /**
   * Get event history
   */
  public getEventHistory(limit: number = 50): GameEvent[] {
    return this.eventHistory.slice(-limit);
  }

  /**
   * Clear processed events
   */
  public clearOldEvents(): void {
    this.events = this.events.filter(e => {
      return Date.now() - e.timestamp < 100 * 1000;
    });
  }

  /**
   * Random event generation (chaos factor)
   */
  public generateRandomEvent(): GameEvent | null {
    const roll = Math.random();

    if (roll < 0.02) {
      // 2% chance for market crash
      const resources = Object.values(ResourceType);
      const resource = resources[Math.floor(Math.random() * resources.length)];
      const severity: 'minor' | 'moderate' | 'severe' = ['minor', 'moderate', 'severe'][
        Math.floor(Math.random() * 3)
      ] as any;
      return this.generateMarketCrash(resource as ResourceType, {} as any, severity);
    } else if (roll < 0.05) {
      // 3% chance for shortage
      const resources = Object.values(ResourceType);
      const resource = resources[Math.floor(Math.random() * resources.length)];
      return this.generateShortage(resource as ResourceType, 'random');
    }

    return null;
  }
}
