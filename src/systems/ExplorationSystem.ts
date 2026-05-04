import { Planet, AsteroidBelt, Sector, SolarSystem, ResourceDeposit, ResourceType } from '../types';

export class ExplorationSystem {
  private discoveredSectors: Map<string, Sector> = new Map();

  /**
   * Generate a new sector procedurally
   */
  public generateSector(id: string, name: string, x: number, y: number, z: number): Sector {
    const sector: Sector = {
      id,
      name,
      coordinate: { x, y, z },
      systems: [],
    };

    // Generate 5-15 solar systems per sector
    const systemCount = 5 + Math.floor(Math.random() * 10);
    for (let i = 0; i < systemCount; i++) {
      const system = this.generateSolarSystem(
        `${id}_sys_${i}`,
        x + Math.random() * 50,
        y + Math.random() * 50,
        z + Math.random() * 50,
        id
      );
      sector.systems.push(system);
    }

    this.discoveredSectors.set(id, sector);
    return sector;
  }

  /**
   * Generate a solar system with planets and belts
   */
  private generateSolarSystem(
    id: string,
    x: number,
    y: number,
    z: number,
    sectorId: string
  ): SolarSystem {
    const system: SolarSystem = {
      id,
      name: this.generateSystemName(),
      coordinate: { x, y, z },
      sectorId,
      planets: [],
      asteroidBelts: [],
    };

    // Generate 2-6 planets
    const planetCount = 2 + Math.floor(Math.random() * 5);
    for (let i = 0; i < planetCount; i++) {
      system.planets.push(
        this.generatePlanet(`${id}_planet_${i}`, id, i)
      );
    }

    // Generate 1-3 asteroid belts
    const beltCount = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < beltCount; i++) {
      system.asteroidBelts.push(
        this.generateAsteroidBelt(`${id}_belt_${i}`, id)
      );
    }

    return system;
  }

  /**
   * Generate a planet with resources
   */
  private generatePlanet(id: string, systemId: string, orbitIndex: number): Planet {
    const types: ('terrestrial' | 'gas_giant' | 'ice')[] = ['terrestrial', 'gas_giant', 'ice'];
    const type = types[Math.floor(Math.random() * types.length)];

    const planet: Planet = {
      id,
      name: `${this.generatePlanetName()} ${String.fromCharCode(65 + orbitIndex)}`,
      systemId,
      type,
      resources: [],
      population: 0,
      colonized: false,
    };

    // Generate resources based on planet type
    const resourceCount = 2 + Math.floor(Math.random() * 4);
    const resourceTypes = Object.values(ResourceType);

    for (let i = 0; i < resourceCount; i++) {
      const resource = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
      planet.resources.push(
        this.generateResourceDeposit(
          `${id}_resource_${i}`,
          resource,
          type
        )
      );
    }

    return planet;
  }

  /**
   * Generate an asteroid belt with many small deposits
   */
  private generateAsteroidBelt(id: string, systemId: string): AsteroidBelt {
    const belt: AsteroidBelt = {
      id,
      systemId,
      resources: [],
      degradation: 0,
    };

    const depositCount = 10 + Math.floor(Math.random() * 20);
    const resourceTypes = Object.values(ResourceType).filter(r =>
      [
        ResourceType.IRON,
        ResourceType.COPPER,
        ResourceType.SILVER,
        ResourceType.SILICON,
        ResourceType.TITANIUM,
        ResourceType.GOLD,
      ].includes(r)
    );

    for (let i = 0; i < depositCount; i++) {
      const resource = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
      belt.resources.push(
        this.generateResourceDeposit(`${id}_resource_${i}`, resource, 'asteroid')
      );
    }

    return belt;
  }

  /**
   * Generate a single resource deposit
   */
  private generateResourceDeposit(
    id: string,
    resourceType: ResourceType,
    location: 'terrestrial' | 'gas_giant' | 'ice' | 'asteroid'
  ): ResourceDeposit {
    let quantityBase = 100000;
    let purityBase = 70;
    let miningRateBase = 100;

    // Adjust based on location
    if (location === 'asteroid') {
      quantityBase = 50000;
      purityBase = 85;
      miningRateBase = 50;
    } else if (location === 'terrestrial') {
      quantityBase = 200000;
      purityBase = 60;
      miningRateBase = 150;
    }

    return {
      id,
      resource: resourceType,
      quantity: quantityBase + Math.random() * 100000,
      purity: purityBase + (Math.random() * 30 - 15),
      miningRate: miningRateBase + Math.random() * 50,
      discovered: false,
    };
  }

  /**
   * Scan for resources in a system (costs fuel/time)
   */
  public scanSystem(system: SolarSystem, discoveredBy: string): void {
    // Mark all deposits as discovered
    for (const planet of system.planets) {
      for (const deposit of planet.resources) {
        deposit.discovered = true;
        deposit.discoveredBy = discoveredBy;
      }
    }

    for (const belt of system.asteroidBelts) {
      for (const deposit of belt.resources) {
        deposit.discovered = true;
        deposit.discoveredBy = discoveredBy;
      }
    }
  }

  /**
   * Deep scan to reveal exact purity and quantity (expensive)
   */
  public deepScan(deposit: ResourceDeposit, accuracy: number = 0.95): ResourceDeposit {
    return {
      ...deposit,
      quantity: deposit.quantity * accuracy,
      purity: deposit.purity * accuracy,
      miningRate: deposit.miningRate * accuracy,
    };
  }

  /**
   * Calculate exploration tax (buying/selling discovery info)
   */
  public calculateDiscoveryValue(deposit: ResourceDeposit, baseResourcePrice: number): number {
    // Value = quantity * purity * price of resource
    const value = (deposit.quantity / 1000) * (deposit.purity / 100) * baseResourcePrice;

    // Premium for exclusive information
    return Math.round(value * 0.1); // 10% of total resource value
  }

  /**
   * Find nearest undiscovered systems from current location
   */
  public getNearestSystemsToExplore(
    currentCoord: { x: number; y: number; z: number },
    exploredSystems: Set<string>,
    maxDistance: number = 200
  ): SolarSystem[] {
    const unexplored: SolarSystem[] = [];

    for (const sector of this.discoveredSectors.values()) {
      for (const system of sector.systems) {
        if (!exploredSystems.has(system.id)) {
          const distance = Math.sqrt(
            Math.pow(system.coordinate.x - currentCoord.x, 2) +
            Math.pow(system.coordinate.y - currentCoord.y, 2) +
            Math.pow(system.coordinate.z - currentCoord.z, 2)
          );

          if (distance <= maxDistance) {
            unexplored.push(system);
          }
        }
      }
    }

    return unexplored.sort((a, b) => {
      const distA = Math.sqrt(
        Math.pow(a.coordinate.x - currentCoord.x, 2) +
        Math.pow(a.coordinate.y - currentCoord.y, 2) +
        Math.pow(a.coordinate.z - currentCoord.z, 2)
      );
      const distB = Math.sqrt(
        Math.pow(b.coordinate.x - currentCoord.x, 2) +
        Math.pow(b.coordinate.y - currentCoord.y, 2) +
        Math.pow(b.coordinate.z - currentCoord.z, 2)
      );
      return distA - distB;
    });
  }

  /**
   * Calculate economic value of a star system for expansion
   */
  public evaluateSystemValue(system: SolarSystem): number {
    let value = 0;

    // Evaluate planets
    for (const planet of system.planets) {
      for (const deposit of planet.resources) {
        value += this.calculateResourceValue(deposit);
      }

      // Colonization potential
      if (planet.type === 'terrestrial') {
        value += 5000; // High colonization value
      } else if (planet.type === 'ice') {
        value += 2000;
      }
    }

    // Evaluate asteroid belts
    for (const belt of system.asteroidBelts) {
      for (const deposit of belt.resources) {
        value += this.calculateResourceValue(deposit);
      }
    }

    return Math.round(value);
  }

  private calculateResourceValue(deposit: ResourceDeposit): number {
    const basePrices: Record<ResourceType, number> = {
      [ResourceType.IRON]: 100,
      [ResourceType.COPPER]: 150,
      [ResourceType.SILVER]: 500,
      [ResourceType.SILICON]: 200,
      [ResourceType.TITANIUM]: 800,
      [ResourceType.GOLD]: 2000,
      [ResourceType.STEEL]: 300,
      [ResourceType.ALLOY]: 600,
      [ResourceType.CIRCUITS]: 1500,
      [ResourceType.FUEL]: 250,
      [ResourceType.ANTIMATERIA]: 10000,
      [ResourceType.FOOD]: 50,
      [ResourceType.OXYGEN]: 75,
      [ResourceType.WATER]: 30,
    };

    const basePrice = basePrices[deposit.resource] || 100;
    return (deposit.quantity / 1000) * (deposit.purity / 100) * basePrice;
  }

  private generateSystemName(): string {
    const prefixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta'];
    const suffixes = ['Centauri', 'Draconis', 'Aquilae', 'Orionis', 'Cygni', 'Persei'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${prefix} ${suffix}`;
  }

  private generatePlanetName(): string {
    const names = ['Terra', 'Mars', 'Venus', 'Saturn', 'Jupiter', 'Neptune', 'Kepler', 'Proxima'];
    return names[Math.floor(Math.random() * names.length)];
  }
}
