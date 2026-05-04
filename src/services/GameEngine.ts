import { GameState, Empire, ResourceType, Resource, Coordinate, TradeRoute, Fleet } from '../types';
import { MarketSystem } from '../systems/MarketSystem';
import { ResourceSystem } from '../systems/ResourceSystem';
import { LogisticsSystem } from '../systems/LogisticsSystem';
import { ExplorationSystem } from '../systems/ExplorationSystem';
import { WarfareSystem } from '../systems/WarfareSystem';
import { EventSystem } from '../systems/EventSystem';
import { v4 as uuidv4 } from 'uuid'; // Using uuid for ID generation

export class GameEngine {
  private gameState: GameState;
  private marketSystem: MarketSystem;
  private resourceSystem: ResourceSystem;
  private logisticsSystem: LogisticsSystem;
  private explorationSystem: ExplorationSystem;
  private warfareSystem: WarfareSystem;
  private eventSystem: EventSystem;

  private cycleInterval: ReturnType<typeof setInterval> | null = null;
  private running: boolean = false;

  constructor() {
    this.marketSystem = new MarketSystem();
    this.resourceSystem = new ResourceSystem();
    this.logisticsSystem = new LogisticsSystem();
    this.explorationSystem = new ExplorationSystem();
    this.warfareSystem = new WarfareSystem();
    this.eventSystem = new EventSystem();

    this.gameState = {
      cycle: 0,
      paused: false,
      empires: new Map(),
      sectors: [],
      marketPrices: new Map(),
      tradeRoutes: [],
    };

    this.initializeUniverse();
  }

  /**
   * Initialize universe with procedural generation
   */
  private initializeUniverse(): void {
    // Generate 5 starting sectors
    for (let i = 0; i < 5; i++) {
      const sector = this.explorationSystem.generateSector(
        `sector_${i}`,
        `Sector ${String.fromCharCode(65 + i)}`,
        i * 100,
        i * 100,
        0
      );
      this.gameState.sectors.push(sector);
    }

    console.log(`[GameEngine] Universe initialized with ${this.gameState.sectors.length} sectors`);
  }

  /**
   * Create a new empire
   */
  public createEmpire(
    playerId: string,
    name: string,
    startingCredits: number = 100000
  ): Empire {
    const empire: Empire = {
      id: uuidv4(),
      name,
      playerId,
      colonies: [],
      treasury: startingCredits,
      resources: [],
      fleets: [],
      contracts: [],
      technology: {
        mining: 1,
        refining: 1,
        manufacturing: 1,
        navigation: 1,
        warfare: 1,
        economy: 1,
      },
    };

    this.gameState.empires.set(empire.id, empire);
    console.log(`[GameEngine] Empire "${name}" created with ID ${empire.id}`);
    return empire;
  }

  /**
   * Start the game loop
   */
  public start(cycleIntervalMs: number = 1000): void {
    if (this.running) return;

    this.running = true;
    console.log(`[GameEngine] Starting game loop with ${cycleIntervalMs}ms cycle time`);

    this.cycleInterval = setInterval(() => {
      if (!this.gameState.paused) {
        this.executeCycle();
      }
    }, cycleIntervalMs);
  }

  /**
   * Stop the game loop
   */
  public stop(): void {
    if (this.cycleInterval !== null) {
      clearInterval(this.cycleInterval as NodeJS.Timeout);
      this.cycleInterval = null;
    }
    this.running = false;
    console.log('[GameEngine] Game stopped');
  }

  /**
   * Execute one game cycle
   */
  private executeCycle(): void {
    this.gameState.cycle++;

    // Phase 1: Resource Production
    this.processProduction();

    // Phase 2: Market Updates
    this.updateMarket();

    // Phase 3: Logistics
    this.processLogistics();

    // Phase 4: Trade Execution
    this.processTrades();

    // Phase 5: Events & Emergent Chaos
    this.processEvents();

    // Phase 6: Empire Finances
    this.processFinances();

    // Phase 7: Technology Progress
    this.advanceTechnology();

    if (this.gameState.cycle % 10 === 0) {
      console.log(`[GameEngine] Cycle ${this.gameState.cycle} completed`);
    }
  }

  /**
   * Phase 1: Calculate production across all colonies
   */
  private processProduction(): void {
    for (const empire of this.gameState.empires.values()) {
      for (const colonyId of empire.colonies) {
        // Simplified: calculate production per colony
        // This would expand with actual colony/facility management
      }
    }
  }

  /**
   * Phase 2: Update market prices based on supply & demand
   */
  private updateMarket(): void {
    const supplyByResource = new Map<ResourceType, number>();
    const demandByResource = new Map<ResourceType, number>();

    // Calculate total supply & demand
    for (const empire of this.gameState.empires.values()) {
      for (const resource of empire.resources) {
        const current = supplyByResource.get(resource.type) || 0;
        supplyByResource.set(resource.type, current + resource.quantity);
      }

      // Demand: simplified as 50% of treasury / average price
      for (const resource of Object.values(ResourceType)) {
        const demand = (empire.treasury / 1000) * Math.random();
        const current = demandByResource.get(resource as ResourceType) || 0;
        demandByResource.set(resource as ResourceType, current + demand);
      }
    }

    this.marketSystem.updateMarketCycle(supplyByResource, demandByResource);
  }

  /**
   * Phase 3: Process fleet movements
   */
  private processLogistics(): void {
    for (const empire of this.gameState.empires.values()) {
      for (const fleet of empire.fleets) {
        if (fleet.destination) {
          const movement = this.logisticsSystem.moveFleet(fleet, fleet.destination, 50); // 50 units per cycle
          
          // Consume fuel
          const fuelNeeded = this.logisticsSystem.calculateFuelConsumption(
            movement.distance,
            fleet.ships.length,
            this.getCargoWeight(fleet.cargo)
          );

          const fuelResource = fleet.cargo.find(r => r.type === ResourceType.FUEL);
          if (fuelResource) {
            fuelResource.quantity = Math.max(0, fuelResource.quantity - fuelNeeded);
          }
        }
      }
    }
  }

  /**
   * Phase 4: Execute active trade contracts
   */
  private processTrades(): void {
    for (const empire of this.gameState.empires.values()) {
      for (const contract of empire.contracts) {
        if (contract.status === 'in_transit') {
          if (Date.now() >= contract.dueDate) {
            const deliveryFleet = empire.fleets.find(f =>
              f.cargo.some(c => c.type === contract.resource)
            );

            if (deliveryFleet) {
              const result = this.logisticsSystem.executeDelivery(contract, deliveryFleet);
              if (result.success) {
                // Add credits for delivery
                empire.treasury += contract.quantity * contract.pricePerUnit;
              }
            }
          }
        }
      }
    }
  }

  /**
   * Phase 5: Generate and process events
   */
  private processEvents(): void {
    const randomEvent = this.eventSystem.generateRandomEvent();
    if (randomEvent) {
      const effects = this.eventSystem.processEventEffects(randomEvent);
      // Apply effects to affected empires
      for (const empireId of randomEvent.affectedEmpires) {
        const empire = this.gameState.empires.get(empireId);
        if (empire && effects['warCost']) {
          empire.treasury -= effects['warCost'] as number;
        }
      }
    }

    this.eventSystem.clearOldEvents();
  }

  /**
   * Phase 6: Process empire financials
   */
  private processFinances(): void {
    for (const empire of this.gameState.empires.values()) {
      // Tax income from colonies (simplified)
      const taxIncome = empire.colonies.length * 1000;
      empire.treasury += taxIncome;

      // Maintenance costs
      const maintenanceCost = empire.fleets.length * 500 + empire.colonies.length * 500;
      empire.treasury = Math.max(0, empire.treasury - maintenanceCost);
    }
  }

  /**
   * Phase 7: Advance technology research
   */
  private advanceTechnology(): void {
    for (const empire of this.gameState.empires.values()) {
      // Very simplified: spend treasury to research
      if (empire.treasury > 10000) {
        const researchBudget = empire.treasury * 0.01; // 1% to research
        empire.treasury -= researchBudget;

        // Randomly improve a tech
        const techs = Object.keys(empire.technology) as Array<keyof typeof empire.technology>;
        const techToImprove = techs[Math.floor(Math.random() * techs.length)];
        empire.technology[techToImprove] += 0.01;
      }
    }
  }

  /**
   * Get current game state snapshot
   */
  public getGameState(): Partial<GameState> {
    return {
      cycle: this.gameState.cycle,
      paused: this.gameState.paused,
      empires: this.gameState.empires,
      sectors: this.gameState.sectors,
    };
  }

  /**
   * Get market information
   */
  public getMarketInfo(resource: ResourceType): any {
    return this.marketSystem.getMarketPrice(resource);
  }

  /**
   * Get all active events
   */
  public getActiveEvents(): any[] {
    return this.eventSystem.getActiveEvents();
  }

  /**
   * Pause/resume game
   */
  public togglePause(): boolean {
    this.gameState.paused = !this.gameState.paused;
    console.log(`[GameEngine] Game ${this.gameState.paused ? 'paused' : 'resumed'}`);
    return this.gameState.paused;
  }

  private getCargoWeight(cargo: Resource[]): number {
    return cargo.reduce((sum, r) => sum + r.quantity, 0);
  }
}

export default GameEngine;
