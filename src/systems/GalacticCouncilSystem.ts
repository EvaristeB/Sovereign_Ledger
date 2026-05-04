/**
 * Galactic Council System
 * Système de votes et lois économiques
 */

export interface CouncilProposal {
  id: string;
  proposerId: string;
  title: string;
  description: string;
  type: 'tax' | 'embargo' | 'subsidy' | 'regulation';
  parameters: Record<string, unknown>;
  votes: Map<string, boolean>; // Empire ID -> yes/no
  status: 'voting' | 'passed' | 'rejected' | 'enacted';
  createdAt: number;
  votingEndAt: number;
  enacted?: boolean;
}

export interface CouncilLaw {
  id: string;
  title: string;
  type: 'tax' | 'embargo' | 'subsidy' | 'regulation';
  parameters: Record<string, unknown>;
  enactedAt: number;
  expiresAt?: number;
  status: 'active' | 'expired' | 'repealed';
}

export class GalacticCouncilSystem {
  private proposals: Map<string, CouncilProposal> = new Map();
  private laws: Map<string, CouncilLaw> = new Map();
  private proposalIdCounter = 0;
  private lawIdCounter = 0;
  private councilMembers: Set<string> = new Set();

  constructor(initialMembers: string[] = []) {
    this.councilMembers = new Set(initialMembers);
  }

  /**
   * Soumettre une proposition au conseil
   */
  public submitProposal(
    proposerId: string,
    title: string,
    description: string,
    proposalType: 'tax' | 'embargo' | 'subsidy' | 'regulation',
    parameters: Record<string, unknown>,
    votingDurationCycles: number = 20
  ): CouncilProposal {
    const proposal: CouncilProposal = {
      id: `prop_${this.proposalIdCounter++}_${Date.now()}`,
      proposerId,
      title,
      description,
      type: proposalType,
      parameters,
      votes: new Map(),
      status: 'voting',
      createdAt: Date.now(),
      votingEndAt: Date.now() + votingDurationCycles * 1000,
    };

    this.proposals.set(proposal.id, proposal);
    return proposal;
  }

  /**
   * Voter sur une proposition
   */
  public vote(proposalId: string, voterId: string, voteYes: boolean): boolean {
    const proposal = this.proposals.get(proposalId);
    if (!proposal || !this.councilMembers.has(voterId)) {
      return false;
    }

    proposal.votes.set(voterId, voteYes);
    return true;
  }

  /**
   * Finaliser les votes et enacter la loi si majorité
   */
  public finalizeVoting(proposalId: string): { passed: boolean; law?: CouncilLaw } {
    const proposal = this.proposals.get(proposalId);
    if (!proposal || proposal.status !== 'voting') {
      return { passed: false };
    }

    if (Date.now() < proposal.votingEndAt) {
      return { passed: false }; // Voting still active
    }

    // Compter les votes
    let yesVotes = 0;
    let totalVotes = 0;

    for (const vote of proposal.votes.values()) {
      if (vote) yesVotes++;
      totalVotes++;
    }

    // Require 50% + 1 majority
    const passed = yesVotes > totalVotes / 2;

    if (passed) {
      proposal.status = 'passed';

      // Créer la loi
      const law: CouncilLaw = {
        id: `law_${this.lawIdCounter++}_${Date.now()}`,
        title: proposal.title,
        type: proposal.type,
        parameters: proposal.parameters,
        enactedAt: Date.now(),
        status: 'active',
      };

      this.laws.set(law.id, law);
      proposal.enacted = true;

      // Définir l'expiration
      if (proposal.type === 'tax' || proposal.type === 'subsidy') {
        law.expiresAt = Date.now() + 100 * 1000; // 100 cycles
      } else if (proposal.type === 'embargo') {
        law.expiresAt = Date.now() + 50 * 1000; // 50 cycles
      }

      return { passed: true, law };
    } else {
      proposal.status = 'rejected';
      return { passed: false };
    }
  }

  /**
   * Exemples de propositions pré-faites
   */
  public proposeTaxOnExport(
    proposerId: string,
    resourceType: string,
    taxPercentage: number
  ): CouncilProposal {
    return this.submitProposal(
      proposerId,
      `Export Tax on ${resourceType}`,
      `Impose ${taxPercentage}% tax on exports of ${resourceType}`,
      'tax',
      { resource: resourceType, taxPercentage }
    );
  }

  /**
   * Proposer une subvention
   */
  public proposeSubsidy(
    proposerId: string,
    objective: string,
    subsidyBudget: number
  ): CouncilProposal {
    return this.submitProposal(
      proposerId,
      `Subsidy for ${objective}`,
      `Allocate ${subsidyBudget} credits towards ${objective}`,
      'subsidy',
      { objective, budget: subsidyBudget }
    );
  }

  /**
   * Proposer embargo collectif
   */
  public proposeGalacticEmbargo(
    proposerId: string,
    targetEmpire: string,
    reason: string
  ): CouncilProposal {
    return this.submitProposal(
      proposerId,
      `Embargo on ${targetEmpire}`,
      `Galactic embargo against ${targetEmpire}: ${reason}`,
      'embargo',
      { targetEmpire, reason }
    );
  }

  /**
   * Ajouter un membre au conseil
   */
  public addCouncilMember(empireId: string): void {
    this.councilMembers.add(empireId);
  }

  /**
   * Retirer un membre du conseil
   */
  public removeCouncilMember(empireId: string): void {
    this.councilMembers.delete(empireId);
  }

  /**
   * Obtenir les propositions active
   */
  public getActiveProposals(): CouncilProposal[] {
    return Array.from(this.proposals.values()).filter(p => p.status === 'voting');
  }

  /**
   * Obtenir les lois actives
   */
  public getActiveLaws(): CouncilLaw[] {
    return Array.from(this.laws.values()).filter(l => {
      if (l.expiresAt) {
        return l.status === 'active' && Date.now() < l.expiresAt;
      }
      return l.status === 'active';
    });
  }

  /**
   * Obtenir les résultats dun vote
   */
  public getVoteResults(proposalId: string): {
    proposal?: CouncilProposal;
    yesVotes: number;
    noVotes: number;
    abstentions: number;
    percentageYes: number;
  } | null {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) return null;

    let yesVotes = 0;
    let noVotes = 0;

    for (const vote of proposal.votes.values()) {
      if (vote) {
        yesVotes++;
      } else {
        noVotes++;
      }
    }

    const abstentions = this.councilMembers.size - yesVotes - noVotes;
    const percentageYes = yesVotes / (yesVotes + noVotes) * 100;

    return {
      proposal,
      yesVotes,
      noVotes,
      abstentions,
      percentageYes: percentageYes || 0,
    };
  }

  /**
   * Vérifier si une loi est active
   */
  public isLawActive(lawId: string): boolean {
    const law = this.laws.get(lawId);
    if (!law || law.status !== 'active') return false;

    if (law.expiresAt && Date.now() >= law.expiresAt) {
      law.status = 'expired';
      return false;
    }

    return true;
  }
}
