import { Fleet, Vessel, TradeRoute, TradeContract, ResourceType, Resource, Coordinate } from '../types';

export class LogisticsSystem {
  /**
   * Calculate travel time between two coordinates
   */
  public calculateTravelTime(from: Coordinate, to: Coordinate, shipSpeed: number = 100): number {
    const distance = Math.sqrt(
      Math.pow(to.x - from.x, 2) +
      Math.pow(to.y - from.y, 2) +
      Math.pow(to.z - from.z, 2)
    );

    // Travel time in game cycles
    return Math.ceil(distance / shipSpeed);
  }

  /**
   * Calculate optimal flux distribution across fleets
   */
  public optimizeRoutesForFlux(routes: TradeRoute[]): Map<string, number> {
    const distribution = new Map<string, number>();

    // Group by dominant resource type
    const byResource = new Map<ResourceType, TradeRoute[]>();
    for (const route of routes) {
      if (!byResource.has(route.resource)) {
        byResource.set(route.resource, []);
      }
      byResource.get(route.resource)!.push(route);
    }

    // Allocate based on market flux potential
    for (const [resource, resourceRoutes] of byResource.entries()) {
      const totalDemand = resourceRoutes.reduce((sum, r) => sum + r.frequency, 0);
      for (const route of resourceRoutes) {
        distribution.set(route.id, (route.frequency / totalDemand) * 100);
      }
    }

    return distribution;
  }

  /**
   * Move fleet towards destination
   */
  public moveFleet(
    fleet: Fleet,
    destination: Coordinate,
    travelSpeedPerCycle: number
  ): { distance: number; cyclesRemaining: number } {
    if (!destination) {
      return { distance: 0, cyclesRemaining: 0 };
    }

    const distance = Math.sqrt(
      Math.pow(destination.x - fleet.currentLocation.x, 2) +
      Math.pow(destination.y - fleet.currentLocation.y, 2) +
      Math.pow(destination.z - fleet.currentLocation.z, 2)
    );

    if (distance < travelSpeedPerCycle) {
      // Arrived
      fleet.currentLocation = destination;
      fleet.destination = undefined;
      return { distance: 0, cyclesRemaining: 0 };
    }

    // Move towards destination
    const ratio = travelSpeedPerCycle / distance;
    fleet.currentLocation = {
      x: fleet.currentLocation.x + (destination.x - fleet.currentLocation.x) * ratio,
      y: fleet.currentLocation.y + (destination.y - fleet.currentLocation.y) * ratio,
      z: fleet.currentLocation.z + (destination.z - fleet.currentLocation.z) * ratio,
    };

    const remaining = distance - travelSpeedPerCycle;
    const cyclesRemaining = Math.ceil(remaining / travelSpeedPerCycle);

    return { distance: remaining, cyclesRemaining };
  }

  /**
   * Calculate cargo capacity of fleet
   */
  public getFleetCapacity(fleet: Fleet): number {
    return fleet.ships.reduce((sum, ship) => sum + ship.cargo, 0);
  }

  /**
   * Calculate cargo weight
   */
  public getCargoWeight(cargo: Resource[]): number {
    return cargo.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Load cargo onto fleet
   */
  public loadCargo(fleet: Fleet, resources: Resource[]): { loaded: Resource[]; rejected: Resource[] } {
    const capacity = this.getFleetCapacity(fleet);
    const currentWeight = this.getCargoWeight(fleet.cargo);
    const available = capacity - currentWeight;

    const loaded: Resource[] = [];
    const rejected: Resource[] = [];

    let remaining = available;
    for (const resource of resources) {
      if (remaining >= resource.quantity) {
        remaining -= resource.quantity;
        loaded.push(resource);
        fleet.cargo.push(resource);
      } else if (remaining > 0) {
        loaded.push({ ...resource, quantity: remaining });
        rejected.push({ ...resource, quantity: resource.quantity - remaining });
        fleet.cargo.push({ ...resource, quantity: remaining });
        remaining = 0;
      } else {
        rejected.push(resource);
      }
    }

    return { loaded, rejected };
  }

  /**
   * Unload cargo from fleet
   */
  public unloadCargo(
    fleet: Fleet,
    resourceType: ResourceType,
    quantity: number
  ): { unloaded: number; remaining: number } {
    let toUnload = quantity;
    let unloaded = 0;

    for (let i = fleet.cargo.length - 1; i >= 0; i--) {
      if (fleet.cargo[i].type === resourceType && toUnload > 0) {
        const amount = Math.min(toUnload, fleet.cargo[i].quantity);
        fleet.cargo[i].quantity -= amount;
        toUnload -= amount;
        unloaded += amount;

        if (fleet.cargo[i].quantity === 0) {
          fleet.cargo.splice(i, 1);
        }
      }
    }

    return { unloaded, remaining: toUnload };
  }

  /**
   * Calculate fuel consumption for travel
   */
  public calculateFuelConsumption(
    distance: number,
    fleetSize: number,
    cargoWeight: number
  ): number {
    // Base: 1 fuel per 100km, modified by fleet size and cargo
    const baseFuel = distance / 100;
    const sizeModifier = fleetSize * 0.1; // Larger fleets burn more
    const cargoModifier = cargoWeight / 1000; // Heavy cargo burns more

    return Math.ceil(baseFuel * (1 + sizeModifier + cargoModifier));
  }

  /**
   * Detect piracy risk on a trade route
   */
  public assessPiracyRisk(
    route: TradeRoute,
    controlledSystems: Map<string, string>,
    conflictLevel: number
  ): number {
    // Risk increases in uncontrolled space and during conflicts
    let risk = conflictLevel * 10;

    // Check if route passes through uncontrolled systems
    const estimatedSystemsOnRoute = Math.ceil(
      Math.sqrt(
        Math.pow(route.destination.x - route.origin.x, 2) +
        Math.pow(route.destination.y - route.origin.y, 2) +
        Math.pow(route.destination.z - route.origin.z, 2)
      ) / 50
    );

    for (let i = 0; i < estimatedSystemsOnRoute; i++) {
      // Simplified: assume random systems
      risk += 5; // Base piracy risk per system
    }

    return Math.min(100, risk);
  }

  /**
   * Create a trade contract
   */
  public createTradeContract(
    buyerId: string,
    sellerId: string,
    resource: ResourceType,
    quantity: number,
    pricePerUnit: number,
    deliveryLocation: Coordinate,
    cyclesUntilDelivery: number
  ): TradeContract {
    return {
      id: `contract_${Date.now()}_${Math.random()}`,
      buyerId,
      sellerId,
      resource,
      quantity,
      pricePerUnit,
      deliveryLocation,
      dueDate: Date.now() + cyclesUntilDelivery,
      status: 'pending',
    };
  }

  /**
   * Execute contract delivery
   */
  public executeDelivery(
    contract: TradeContract,
    deliveryFleet: Fleet
  ): { success: boolean; error?: string } {
    const cargoItem = deliveryFleet.cargo.find(c => c.type === contract.resource);
    if (!cargoItem || cargoItem.quantity < contract.quantity) {
      return { success: false, error: 'Insufficient cargo for delivery' };
    }

    if (Date.now() > contract.dueDate) {
      return { success: false, error: 'Contract delivery deadline passed' };
    }

    // Transfer cargo
    cargoItem.quantity -= contract.quantity;
    if (cargoItem.quantity === 0) {
      deliveryFleet.cargo = deliveryFleet.cargo.filter(c => c !== cargoItem);
    }

    contract.status = 'completed';
    return { success: true };
  }

  /**
   * Calculate shipping cost
   */
  public calculateShippingCost(
    distance: number,
    weight: number,
    engineTech: number
  ): number {
    const baseCost = distance * weight * 0.001;
    const techDiscount = engineTech * 0.01; // 1% reduction per tech level
    return Math.ceil(baseCost * (1 - techDiscount));
  }

  /**
   * Estimate profit for a trade route after logistics
   */
  public estimateTradeProfit(
    buyPrice: number,
    sellPrice: number,
    quantity: number,
    distance: number,
    weight: number,
    engineTech: number
  ): number {
    const revenue = sellPrice * quantity;
    const cost = buyPrice * quantity;
    const shipping = this.calculateShippingCost(distance, weight, engineTech);

    return revenue - cost - shipping;
  }
}
