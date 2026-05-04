import { Empire } from '../types';

export interface DiplomaticProposal {
  id: string;
  initiatorId: string;
  targetId: string;
  type: 'alliance' | 'trade_deal' | 'tribute' | 'ceasefire' | 'embargo';
  terms: Record<string, unknown>;
  status: 'proposed' | 'accepted' | 'rejected' | 'expired';
  createdAt: number;
  expiresAt: number;
  response?: {
    accepted: boolean;
    respondedAt: number;
  };
}

export interface Alliance {
  id: string;
  members: string[]; // Empire IDs
  name: string;
  createdAt: number;
  type: 'mutual_defense' | 'trade_union' | 'cartel';
  shared_treasury?: number;
  rules?: string[];
}

export interface Embargo {
  id: string;
  embargoingEmpire: string;
  targetEmpire: string;
  resources: string[];
  severity: 'mild' | 'moderate' | 'severe'; // % tax/block
  startDate: number;
  duration: number; // cycles
  reason: string;
}

export interface Tribute {
  id: string;
  payerId: string;
  recipientId: string;
  amount: number; // credits
  frequency: 'once' | 'per_cycle'; // Single payment or recurring
  reason: string;
  startDate: number;
  endDate?: number;
  status: 'active' | 'completed' | 'cancelled';
}

/**
 * Diplomacy System
 * Gère les relations complexes entre empires
 */
export class DiplomacySystem {
  private proposals: Map<string, DiplomaticProposal> = new Map();
  private alliances: Map<string, Alliance> = new Map();
  private embargoes: Map<string, Embargo> = new Map();
  private tributes: Map<string, Tribute> = new Map();
  private relationshipScores: Map<string, number> = new Map(); // Empire pairs: "emp1_emp2" -> -100 to +100
  private proposalIdCounter = 0;
  private allianceIdCounter = 0;

  /**
   * Proposer une alliance
   */
  public proposeAlliance(
    initiatorId: string,
    targetId: string,
    allianceType: 'mutual_defense' | 'trade_union' | 'cartel',
    proposedTerms: Record<string, unknown> = {}
  ): DiplomaticProposal {
    const proposal: DiplomaticProposal = {
      id: `prop_${this.proposalIdCounter++}_${Date.now()}`,
      initiatorId,
      targetId,
      type: 'alliance',
      terms: {
        allianceType,
        ...proposedTerms,
      },
      status: 'proposed',
      createdAt: Date.now(),
      expiresAt: Date.now() + 50 * 1000, // 50 cycles
    };

    this.proposals.set(proposal.id, proposal);
    this.influenceRelationship(initiatorId, targetId, 10); // +10 pour proposition amicale
    return proposal;
  }

  /**
   * Accepter une alliance proposal
   */
  public acceptAlliance(proposalId: string): { success: boolean; alliance?: Alliance; error?: string } {
    const proposal = this.proposals.get(proposalId);
    if (!proposal || proposal.type !== 'alliance') {
      return { success: false, error: 'Proposal introuvable' };
    }

    if (proposal.status !== 'proposed') {
      return { success: false, error: 'Proposal not valid' };
    }

    // Créer l'alliance
    const alliance: Alliance = {
      id: `ally_${this.allianceIdCounter++}_${Date.now()}`,
      members: [proposal.initiatorId, proposal.targetId],
      name: `Alliance_${proposal.initiatorId.slice(0, 4)}_${proposal.targetId.slice(0, 4)}`,
      createdAt: Date.now(),
      type: proposal.terms['allianceType'] as any,
    };

    this.alliances.set(alliance.id, alliance);

    proposal.status = 'accepted';
    proposal.response = { accepted: true, respondedAt: Date.now() };

    this.influenceRelationship(proposal.targetId, proposal.initiatorId, 20); // +20 pour acceptation
    return { success: true, alliance };
  }

  /**
   * Refuser une proposal
   */
  public rejectProposal(proposalId: string): boolean {
    const proposal = this.proposals.get(proposalId);
    if (!proposal || proposal.status !== 'proposed') return false;

    proposal.status = 'rejected';
    proposal.response = { accepted: false, respondedAt: Date.now() };

    this.influenceRelationship(proposal.targetId, proposal.initiatorId, -15); // -15 pour refus
    return true;
  }

  /**
   * Proposer un embargo
   */
  public proposeEmbargo(
    initiatorId: string,
    targetId: string,
    resources: string[],
    severity: 'mild' | 'moderate' | 'severe',
    reason: string,
    durationCycles: number
  ): DiplomaticProposal {
    const proposal: DiplomaticProposal = {
      id: `prop_${this.proposalIdCounter++}_${Date.now()}`,
      initiatorId,
      targetId,
      type: 'embargo',
      terms: {
        resources,
        severity,
        reason,
        durationCycles,
      },
      status: 'proposed',
      createdAt: Date.now(),
      expiresAt: Date.now() + 30 * 1000, // 30 cycles
    };

    this.proposals.set(proposal.id, proposal);
    this.influenceRelationship(initiatorId, targetId, -30); // -30 relations
    return proposal;
  }

  /**
   * Accepter un embargo
   */
  public acceptEmbargo(proposalId: string): { success: boolean; embargo?: Embargo; error?: string } {
    const proposal = this.proposals.get(proposalId);
    if (!proposal || proposal.type !== 'embargo') {
      return { success: false, error: 'Invalid proposal' };
    }

    const embargo: Embargo = {
      id: `embargo_${Date.now()}`,
      embargoingEmpire: proposal.initiatorId,
      targetEmpire: proposal.targetId,
      resources: proposal.terms['resources'] as string[],
      severity: proposal.terms['severity'] as any,
      startDate: Date.now(),
      duration: proposal.terms['durationCycles'] as number,
      reason: proposal.terms['reason'] as string,
    };

    this.embargoes.set(embargo.id, embargo);
    proposal.status = 'accepted';
    return { success: true, embargo };
  }

  /**
   * Demander un tribut
   */
  public proposeTribute(
    demanderId: string,
    payerId: string,
    amount: number,
    reason: string
  ): DiplomaticProposal {
    const proposal: DiplomaticProposal = {
      id: `prop_${this.proposalIdCounter++}_${Date.now()}`,
      initiatorId: demanderId,
      targetId: payerId,
      type: 'tribute',
      terms: {
        amount,
        reason,
        frequency: 'per_cycle',
      },
      status: 'proposed',
      createdAt: Date.now(),
      expiresAt: Date.now() + 40 * 1000,
    };

    this.proposals.set(proposal.id, proposal);
    this.influenceRelationship(demanderId, payerId, -50); // -50 pour menace
    return proposal;
  }

  /**
   * Accepter un tribut
   */
  public acceptTribute(proposalId: string): { success: boolean; tribute?: Tribute; error?: string } {
    const proposal = this.proposals.get(proposalId);
    if (!proposal || proposal.type !== 'tribute') {
      return { success: false, error: 'Invalid proposal' };
    }

    const tribute: Tribute = {
      id: `tribute_${Date.now()}`,
      payerId: proposal.targetId,
      recipientId: proposal.initiatorId,
      amount: proposal.terms['amount'] as number,
      frequency: 'per_cycle',
      reason: proposal.terms['reason'] as string,
      startDate: Date.now(),
      status: 'active',
    };

    this.tributes.set(tribute.id, tribute);
    proposal.status = 'accepted';
    this.influenceRelationship(proposal.targetId, proposal.initiatorId, -70); // -70 pour soumission
    return { success: true, tribute };
  }

  /**
   * Obtenir le score de relation entre deux empires (-100 à +100)
   */
  public getRelationshipScore(empireA: string, empireB: string): number {
    const key = this.normalizeKey(empireA, empireB);
    return this.relationshipScores.get(key) || 0;
  }

  /**
   * Influencer les relations
   */
  private influenceRelationship(empireA: string, empireB: string, delta: number): void {
    const key = this.normalizeKey(empireA, empireB);
    let current = this.relationshipScores.get(key) || 0;
    current = Math.max(-100, Math.min(100, current + delta));
    this.relationshipScores.set(key, current);
  }

  /**
   * Récupérer les embargoes actifs
   */
  public getActiveEmbargoes(): Embargo[] {
    return Array.from(this.embargoes.values()).filter(e => {
      const elapsed = (Date.now() - e.startDate) / 1000;
      return elapsed < e.duration * 1000;
    });
  }

  /**
   * Récupérer les tributs actifs pour un empire
   */
  public getActiveTributes(payerId: string): Tribute[] {
    return Array.from(this.tributes.values()).filter(
      t => t.payerId === payerId && t.status === 'active'
    );
  }

  /**
   * Traiter les tributs cycliques
   */
  public processCyclicTributes(empireBalances: Map<string, Empire>): Map<string, number> {
    const transfers = new Map<string, number>();

    for (const tribute of this.tributes.values()) {
      if (tribute.status === 'active' && tribute.frequency === 'per_cycle') {
        const payer = empireBalances.get(tribute.payerId);
        const recipient = empireBalances.get(tribute.recipientId);

        if (payer && recipient && payer.treasury >= tribute.amount) {
          payer.treasury -= tribute.amount;
          recipient.treasury += tribute.amount;

          const key = `${tribute.payerId}_to_${tribute.recipientId}`;
          transfers.set(key, (transfers.get(key) || 0) + tribute.amount);
        }
      }
    }

    return transfers;
  }

  /**
   * Créer une union commerciale (cartel)
   */
  public formCartel(
    members: string[],
    cartilName: string,
    targetResource: string,
    priceFloor: number
  ): Alliance {
    const alliance: Alliance = {
      id: `cartel_${this.allianceIdCounter++}_${Date.now()}`,
      members,
      name: cartilName,
      createdAt: Date.now(),
      type: 'cartel',
      rules: [`Price floor for ${targetResource}: ${priceFloor}`],
    };

    this.alliances.set(alliance.id, alliance);

    // Améliorer les relations mutuelles
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        this.influenceRelationship(members[i], members[j], 40);
      }
    }

    return alliance;
  }

  /**
   * Quitter une alliance
   */
  public leaveAlliance(allianceId: string, memberId: string): boolean {
    const alliance = this.alliances.get(allianceId);
    if (!alliance) return false;

    const index = alliance.members.indexOf(memberId);
    if (index === -1) return false;

    alliance.members.splice(index, 1);

    // Détériorer les relations
    for (const member of alliance.members) {
      this.influenceRelationship(memberId, member, -30);
    }

    if (alliance.members.length === 0) {
      this.alliances.delete(allianceId);
    }

    return true;
  }

  /**
   * Obtenir toutes les alliances d'un empire
   */
  public getEmpireAlliances(empireId: string): Alliance[] {
    return Array.from(this.alliances.values()).filter(a =>
      a.members.includes(empireId)
    );
  }

  /**
   * Vérifier si deux empires sont alliés
   */
  public areAllied(empireA: string, empireB: string): boolean {
    for (const alliance of this.alliances.values()) {
      if (alliance.members.includes(empireA) && alliance.members.includes(empireB)) {
        return true;
      }
    }
    return false;
  }

  private normalizeKey(a: string, b: string): string {
    return [a, b].sort().join('_');
  }
}
