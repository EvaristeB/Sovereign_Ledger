import { GameEvent, ResourceType } from '../types';
import { MarketSystem } from './MarketSystem';

/**
 * Enhanced Event System
 * Génère des événements complexes et interconnectés
 * Catastrophes, sabotages, crises politiques
 */
export class EventSystemV2 {
  private events: GameEvent[] = [];
  private eventHistory: GameEvent[] = [];
  private eventIdCounter = 0;

  /**
   * Solar Storm - Catastrophe naturelle
   * Isole secteur de supply chain
   */
  public generateSolarStorm(
    affectedSector: string,
    durationCycles: number,
    affectedSystems: string[] = []
  ): GameEvent {
    const event: GameEvent = {
      id: `storm_${this.eventIdCounter++}_${Date.now()}`,
      type: 'invasion', // Réutiliser type comme catastrophe
      timestamp: Date.now(),
      affectedEmpires: [],
      data: {
        eventType: 'solar_storm',
        sector: affectedSector,
        systems: affectedSystems,
        duration: durationCycles,
        navigationGrille: false, // All navigation offline
        supplyChainDisruption: 0.8, // 80% trade reduction
      },
    };

    this.events.push(event);
    this.eventHistory.push(event);
    return event;
  }

  /**
   * Asteroid Impact - Frappe une planète
   */
  public generateAsteroidImpact(
    planetId: string,
    empireId: string,
    damagePercentage: number = 30
  ): GameEvent {
    const event: GameEvent = {
      id: `impact_${this.eventIdCounter++}_${Date.now()}`,
      type: 'invasion',
      timestamp: Date.now(),
      affectedEmpires: [empireId],
      data: {
        eventType: 'asteroid_impact',
        planet: planetId,
        infrastructureDamage: damagePercentage,
        populationLoss: Math.floor(damagePercentage / 3),
      },
    };

    this.events.push(event);
    this.eventHistory.push(event);
    return event;
  }

  /**
   * Industrial Sabotage - Attaque clandestine sur mines/usines
   */
  public generateSabotage(
    targetEmpireId: string,
    facilityType: string,
    severity: 'minor' | 'moderate' | 'severe' = 'moderate'
  ): GameEvent {
    const productionLoss = severity === 'minor' ? 0.1 : severity === 'moderate' ? 0.3 : 0.6;

    const event: GameEvent = {
      id: `sabotage_${this.eventIdCounter++}_${Date.now()}`,
      type: 'invasion',
      timestamp: Date.now(),
      affectedEmpires: [targetEmpireId],
      data: {
        eventType: 'industrial_sabotage',
        facilityType,
        productionLoss,
        repairCost: 5000 + Math.random() * 15000,
        reputationDamage: -30,
      },
    };

    this.events.push(event);
    this.eventHistory.push(event);
    return event;
  }

  /**
   * Worker Strike - Révolte généralisée
   */
  public generateWorkerStrike(
    empireId: string,
    reason: 'low_wages' | 'poor_conditions' | 'political' = 'low_wages',
    severity: 'mild' | 'moderate' | 'severe' = 'moderate'
  ): GameEvent {
    const productionStop = severity === 'mild' ? 0.3 : severity === 'moderate' ? 0.6 : 1.0;
    const durationCycles = severity === 'mild' ? 10 : severity === 'moderate' ? 20 : 50;

    const event: GameEvent = {
      id: `strike_${this.eventIdCounter++}_${Date.now()}`,
      type: 'revolt',
      timestamp: Date.now(),
      affectedEmpires: [empireId],
      data: {
        eventType: 'worker_strike',
        reason,
        productionStop,
        durationCycles,
        demandIncrease: reason === 'low_wages' ? 25 : 10,
      },
    };

    this.events.push(event);
    this.eventHistory.push(event);
    return event;
  }

  /**
   * Black Swan Market Event - Événement inattendu catastrophique
   */
  public generateBlackSwanEvent(
    affectedEmpires: string[]
  ): GameEvent {
    const events_list = [
      'AI rebellion on colony',
      'Quantum processor breakthrough impacts entire market',
      'Discovery of unlimited resource cache',
      'Military coup in key faction',
      'Currency devaluation emergency',
    ];

    const description = events_list[Math.floor(Math.random() * events_list.length)];

    const event: GameEvent = {
      id: `blackswan_${this.eventIdCounter++}_${Date.now()}`,
      type: 'market_crash',
      timestamp: Date.now(),
      affectedEmpires,
      data: {
        eventType: 'black_swan',
        description,
        marketVolatility: 1.5, // 50% more volatile
        uncertain: true,
      },
    };

    this.events.push(event);
    this.eventHistory.push(event);
    return event;
  }

  /**
   * Resource Discovery Boom - Ressource découverte accidentellement
   */
  public generateResourceDiscovery(
    discoveredBy: string,
    resource: ResourceType,
    quantity: number,
    purity: number
  ): GameEvent {
    const event: GameEvent = {
      id: `discovery_${this.eventIdCounter++}_${Date.now()}`,
      type: 'discovery',
      timestamp: Date.now(),
      affectedEmpires: [discoveredBy],
      data: {
        eventType: 'resource_boom',
        resource,
        quantity,
        purity,
        location: 'undisclosed',
        priceImpact: -50, // Glut on market
      },
    };

    this.events.push(event);
    this.eventHistory.push(event);
    return event;
  }

  /**
   * Pirate Fleet Activity - Menace corsaire active
   */
  public generatePirateActivity(
    affectedSector: string,
    pirateStrength: number = 50
  ): GameEvent {
    const event: GameEvent = {
      id: `pirates_${this.eventIdCounter++}_${Date.now()}`,
      type: 'invasion',
      timestamp: Date.now(),
      affectedEmpires: [],
      data: {
        eventType: 'pirate_emergence',
        sector: affectedSector,
        strength: pirateStrength,
        cargoLossPercentage: 0.4, // 40% cargo at risk
        requiredDefense: pirateStrength * 2, // Need 2x strength to defeat
      },
    };

    this.events.push(event);
    this.eventHistory.push(event);
    return event;
  }

  /**
   * Economic Depression - Récession globale
   */
  public generateRecession(
    duration: number = 30,
    severity: 'mild' | 'moderate' | 'severe' = 'moderate'
  ): GameEvent {
    const demandMultiplier = severity === 'mild' ? 0.7 : severity === 'moderate' ? 0.4 : 0.1;
    const priceVolatility = severity === 'mild' ? 1.2 : severity === 'moderate' ? 1.8 : 3.0;

    const event: GameEvent = {
      id: `recession_${this.eventIdCounter++}_${Date.now()}`,
      type: 'market_crash',
      timestamp: Date.now(),
      affectedEmpires: [],
      data: {
        eventType: 'economic_depression',
        duration,
        demandMultiplier,
        priceVolatility,
        unemploymentWave: true,
      },
    };

    this.events.push(event);
    this.eventHistory.push(event);
    return event;
  }

  /**
   * Monopoly Breakthrough - Un joueur contrôle 90% d'une ressource
   */
  public generateMonopolyAlert(
    empireId: string,
    resource: ResourceType,
    percentage: number
  ): GameEvent {
    const event: GameEvent = {
      id: `monopoly_${this.eventIdCounter++}_${Date.now()}`,
      type: 'war_declared', // Use as alert type
      timestamp: Date.now(),
      affectedEmpires: [empireId],
      data: {
        eventType: 'monopoly_alert',
        resource,
        controlPercentage: percentage,
        priceInflation: (percentage - 50) * 2, // Price goes up with control
      },
    };

    this.events.push(event);
    this.eventHistory.push(event);
    return event;
  }

  /**
   * Espionage Revelation - Découverte d'espionnage
   */
  public generateEspionageExposure(
    spyEmpireId: string,
    targetEmpireId: string,
    secretValue: number
  ): GameEvent {
    const event: GameEvent = {
      id: `espionage_${this.eventIdCounter++}_${Date.now()}`,
      type: 'war_declared',
      timestamp: Date.now(),
      affectedEmpires: [spyEmpireId, targetEmpireId],
      data: {
        eventType: 'espionage_exposed',
        spy: spyEmpireId,
        target: targetEmpireId,
        secretValue,
        relationshipDamage: -80,
        warProbability: 0.6,
      },
    };

    this.events.push(event);
    this.eventHistory.push(event);
    return event;
  }

  // Original methods
  public generateShortage(resource: ResourceType, sector: string): GameEvent {
    const event: GameEvent = {
      id: `shortage_${this.eventIdCounter++}_${Date.now()}`,
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

  public generateSurplus(resource: ResourceType, quantity: number): GameEvent {
    const event: GameEvent = {
      id: `surplus_${this.eventIdCounter++}_${Date.now()}`,
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

  public generateInvasion(
    locationId: string,
    invasionForce: number,
    affectedEmpires: string[]
  ): GameEvent {
    const event: GameEvent = {
      id: `invasion_${this.eventIdCounter++}_${Date.now()}`,
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

  public generateWorkerRevolt(
    colonyId: string,
    empireId: string,
    reason: string
  ): GameEvent {
    const event: GameEvent = {
      id: `revolt_${this.eventIdCounter++}_${Date.now()}`,
      type: 'revolt',
      timestamp: Date.now(),
      affectedEmpires: [empireId],
      data: {
        colony: colonyId,
        reason,
        productionStop: 0.5,
      },
    };

    this.events.push(event);
    this.eventHistory.push(event);
    return event;
  }

  public generateWarDeclaration(
    aggressor: string,
    defender: string,
    cause: string
  ): GameEvent {
    const event: GameEvent = {
      id: `war_${this.eventIdCounter++}_${Date.now()}`,
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

  public getActiveEvents(): GameEvent[] {
    return this.events.filter(e => {
      return Date.now() - e.timestamp < 100 * 1000;
    });
  }

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
        effects['warCost'] = 1000;
        break;
      case 'discovery':
        effects['windfall'] = event.data['quantity'];
        break;
    }

    return effects;
  }

  public getEventHistory(limit: number = 50): GameEvent[] {
    return this.eventHistory.slice(-limit);
  }

  public clearOldEvents(): void {
    this.events = this.events.filter(e => {
      return Date.now() - e.timestamp < 100 * 1000;
    });
  }

  public generateRandomEvent(): GameEvent | null {
    const roll = Math.random();

    if (roll < 0.02) {
      const resources = Object.values(ResourceType);
      const resource = resources[Math.floor(Math.random() * resources.length)];
      const severity: 'minor' | 'moderate' | 'severe' = ['minor', 'moderate', 'severe'][
        Math.floor(Math.random() * 3)
      ] as any;
      return this.generateBlackSwanEvent([]);
    } else if (roll < 0.05) {
      const resources = Object.values(ResourceType);
      const resource = resources[Math.floor(Math.random() * resources.length)];
      return this.generateShortage(resource as ResourceType, 'random');
    } else if (roll < 0.08) {
      return this.generateRecession(30, 'mild');
    } else if (roll < 0.10) {
      return this.generateWorkerStrike('unknown', 'low_wages', 'mild');
    }

    return null;
  }
}
