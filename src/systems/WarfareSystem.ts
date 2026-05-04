import { Empire, Coordinate, GameEvent, ResourceType, Fleet } from '../types';

export class WarfareSystem {
  private conflicts: Map<string, Conflict> = new Map();
  private blockades: Blockade[] = [];

  /**
   * Calculate ship combat power
   */
  public calculateCombatPower(fleet: Fleet, wardateTech: number): number {
    let power = 0;

    for (const ship of fleet.ships) {
      let shipPower = 0;
      switch (ship.type) {
        case 'fighter':
          shipPower = 10;
          break;
        case 'corvette':
          shipPower = 50;
          break;
        case 'cruiser':
          shipPower = 200;
          break;
        case 'dreadnought':
          shipPower = 1000;
          break;
        case 'cargo':
          shipPower = 0; // No combat value
          break;
      }

      // Apply tech bonus
      shipPower *= 1 + wardateTech * 0.1;
      power += shipPower;
    }

    return power;
  }

  /**
   * Resolve combat between two fleets
   */
  public resolveBattle(
    attacker: Fleet,
    attackerTech: number,
    defender: Fleet,
    defenderTech: number
  ): BattleResult {
    const attackPower = this.calculateCombatPower(attacker, attackerTech);
    const defendPower = this.calculateCombatPower(defender, defenderTech);

    const totalPower = attackPower + defendPower;
    const attackerWinChance = attackPower / totalPower;

    const result = Math.random() < attackerWinChance ? 'attacker_wins' : 'defender_wins';

    // Calculate losses
    const losses = this.calculateCasualties(
      attacker.ships,
      defender.ships,
      result,
      totalPower
    );

    // Apply damage
    this.applyShipLosses(attacker, losses.attackerShips);
    this.applyShipLosses(defender, losses.defenderShips);

    return {
      winner: result,
      attackerShipsLost: losses.attackerShips.length,
      defenderShipsLost: losses.defenderShips.length,
      attacker: attacker,
      defender: defender,
    };
  }

  /**
   * Establish a blockade on a trade route
   */
  public createBlockade(
    blockadeFleet: Fleet,
    targetLocation: Coordinate,
    empireId: string,
    duration: number
  ): Blockade {
    const blockade: Blockade = {
      id: `blockade_${Date.now()}`,
      fleetId: blockadeFleet.id,
      empireId,
      targetLocation,
      strength: this.calculateCombatPower(blockadeFleet, 1), // Base tech
      duration,
      startTime: Date.now(),
      affected: [],
    };

    this.blockades.push(blockade);
    return blockade;
  }

  /**
   * Check if a trade route is blocked
   */
  public isRouteBlocked(
    from: Coordinate,
    to: Coordinate,
    ownerEmpireId: string
  ): Blockade | null {
    for (const blockade of this.blockades) {
      // Simple check: if blockade is near the route origin or destination
      const distFromOrigin = Math.sqrt(
        Math.pow(blockade.targetLocation.x - from.x, 2) +
        Math.pow(blockade.targetLocation.y - from.y, 2) +
        Math.pow(blockade.targetLocation.z - from.z, 2)
      );

      const distFromDestination = Math.sqrt(
        Math.pow(blockade.targetLocation.x - to.x, 2) +
        Math.pow(blockade.targetLocation.y - to.y, 2) +
        Math.pow(blockade.targetLocation.z - to.z, 2)
      );

      // Blockade is effective within 50km
      if ((distFromOrigin < 50 || distFromDestination < 50) && blockade.empireId !== ownerEmpireId) {
        return blockade;
      }
    }

    return null;
  }

  /**
   * Declare war
   */
  public declareWar(aggressor: Empire, defender: Empire): Conflict {
    const conflictId = `war_${Date.now()}`;

    const conflict: Conflict = {
      id: conflictId,
      sides: [
        { empireId: aggressor.id, warScore: 0 },
        { empireId: defender.id, warScore: 0 },
      ],
      causedBy: null,
      startTime: Date.now(),
      economicDamage: 0,
      militaryCasualties: 0,
    };

    this.conflicts.set(conflictId, conflict);
    return conflict;
  }

  /**
   * Calculate economic damage from war
   */
  public calculateEconomicDamage(
    targetEmpire: Empire,
    warfare: WarfareSystem,
    conflictId: string
  ): number {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) return 0;

    const damagePerCycle = targetEmpire.treasury * 0.05; // 5% of treasury per cycle of war
    return Math.round(damagePerCycle);
  }

  /**
   * Perform pirate raid on a fleet
   */
  public executePirateRaid(
    targetFleet: Fleet,
    piratePower: number,
    targetTech: number
  ): PirateRaidResult {
    const targetPower = this.calculateCombatPower(targetFleet, targetTech);

    if (piratePower > targetPower) {
      // Pirates win, steal cargo
      const stolenCargo = Math.floor(targetFleet.cargo.length * Math.random());
      return {
        success: true,
        cargoStolen: stolenCargo,
        crewKilled: Math.floor(targetFleet.ships.length * 0.3),
      };
    } else {
      // Fleet escapes
      return {
        success: false,
        cargoStolen: 0,
        crewKilled: 0,
      };
    }
  }

  /**
   * Assess military threat from another empire
   */
  public assessMilitaryThreat(
    attacker: Empire,
    defender: Empire,
    attackerTech: number,
    defenderTech: number
  ): {
    threatLevel: 'low' | 'medium' | 'high' | 'critical';
    estimatedWinChance: number;
  } {
    let attackerPower = 0;
    let defenderPower = 0;

    for (const fleet of attacker.fleets) {
      attackerPower += this.calculateCombatPower(fleet, attackerTech);
    }

    for (const fleet of defender.fleets) {
      defenderPower += this.calculateCombatPower(fleet, defenderTech);
    }

    const winChance = attackerPower / (attackerPower + defenderPower + 1);

    let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (winChance > 0.7) threatLevel = 'critical';
    else if (winChance > 0.55) threatLevel = 'high';
    else if (winChance > 0.45) threatLevel = 'medium';

    return { threatLevel, estimatedWinChance: winChance };
  }

  /**
   * Propose peace treaty with economic terms
   */
  public proposePeaceTreaty(
    side1: Empire,
    side2: Empire,
    reparations: number,
    territoryTransfers: string[]
  ): PeaceTreaty {
    return {
      id: `treaty_${Date.now()}`,
      sides: [side1.id, side2.id],
      reparations,
      territoryTransfers,
      status: 'proposed',
      createdAt: Date.now(),
    };
  }

  private calculateCasualties(
    attackerShips: any[],
    defenderShips: any[],
    result: string,
    totalPower: number
  ): { attackerShips: any[]; defenderShips: any[] } {
    const ratio = result === 'attacker_wins' ? 0.3 : 0.7;

    const attackerLosses = attackerShips
      .slice()
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(attackerShips.length * ratio));

    const defenderLosses = defenderShips
      .slice()
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(defenderShips.length * (1 - ratio)));

    return {
      attackerShips: attackerLosses,
      defenderShips: defenderLosses,
    };
  }

  private applyShipLosses(fleet: Fleet, lostShips: any[]): void {
    for (const lost of lostShips) {
      fleet.ships = fleet.ships.filter(s => s.id !== lost.id);
    }
  }
}

export interface Conflict {
  id: string;
  sides: WarSide[];
  causedBy: string | null;
  startTime: number;
  economicDamage: number;
  militaryCasualties: number;
}

export interface WarSide {
  empireId: string;
  warScore: number;
}

export interface Blockade {
  id: string;
  fleetId: string;
  empireId: string;
  targetLocation: Coordinate;
  strength: number;
  duration: number;
  startTime: number;
  affected: string[];
}

export interface BattleResult {
  winner: 'attacker_wins' | 'defender_wins';
  attackerShipsLost: number;
  defenderShipsLost: number;
  attacker: Fleet;
  defender: Fleet;
}

export interface PirateRaidResult {
  success: boolean;
  cargoStolen: number;
  crewKilled: number;
}

export interface PeaceTreaty {
  id: string;
  sides: string[];
  reparations: number;
  territoryTransfers: string[];
  status: 'proposed' | 'signed' | 'broken';
  createdAt: number;
}
