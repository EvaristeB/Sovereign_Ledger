import {
  ResourceType,
  ResourceDeposit,
  Colony,
  ProductionFacility,
  Warehouse,
  Resource,
} from '../types';

export class ResourceSystem {
  /**
   * Mine resources from a deposit
   */
  public mine(deposit: ResourceDeposit, miningRate: number): Resource {
    const mined = Math.min(miningRate, deposit.quantity);
    deposit.quantity -= mined;

    // Degradation: each cycle reduces purity slightly
    deposit.purity = Math.max(10, deposit.purity - 0.5);
    deposit.miningRate = Math.max(1, deposit.miningRate * 0.98); // Equipment degradation

    return {
      type: deposit.resource,
      quantity: mined,
      purity: deposit.purity,
    };
  }

  /**
   * Refine raw materials into pure materials
   * e.g., Iron ore -> Steel
   */
  public refine(
    input: Resource,
    refiningRate: number,
    efficiency: number
  ): Resource {
    const purityBonus = input.purity ? input.purity / 100 : 0.7;
    const refined = Math.min(refiningRate, input.quantity) * purityBonus * (efficiency / 100);

    return {
      type: this.getRefinedResource(input.type),
      quantity: refined,
      purity: 95,
    };
  }

  /**
   * Process materials for manufacturing
   */
  public manufacture(
    inputs: Resource[],
    productionRate: number,
    efficiency: number
  ): Resource {
    // Simplified: need multiple inputs to produce
    const minInput = Math.min(...inputs.map(r => r.quantity));
    const produced = Math.min(productionRate, minInput) * (efficiency / 100);

    return {
      type: ResourceType.CIRCUITS, // Simplified example
      quantity: produced,
    };
  }

  /**
   * Store resources in warehouse with capacity limits
   */
  public store(warehouse: Warehouse, resource: Resource): { stored: number; overflow: number } {
    const available = warehouse.capacity - this.getTotalStoredQuantity(warehouse);
    const stored = Math.min(available, resource.quantity);
    const overflow = resource.quantity - stored;

    if (stored > 0) {
      const existing = warehouse.stored.find(r => r.type === resource.type);
      if (existing) {
        existing.quantity += stored;
      } else {
        warehouse.stored.push({ ...resource, quantity: stored });
      }
    }

    return { stored, overflow };
  }

  /**
   * Retrieve resources from warehouse
   */
  public retrieve(warehouse: Warehouse, resourceType: ResourceType, quantity: number): Resource {
    const stored = warehouse.stored.find(r => r.type === resourceType);
    if (!stored) {
      return { type: resourceType, quantity: 0 };
    }

    const retrieved = Math.min(quantity, stored.quantity);
    stored.quantity -= retrieved;

    if (stored.quantity === 0) {
      warehouse.stored = warehouse.stored.filter(r => r.type !== resourceType);
    }

    return { type: resourceType, quantity: retrieved };
  }

  /**
   * Calculate production for a facility in a cycle
   */
  public produceInCycle(facility: ProductionFacility): Resource {
    let output: Resource;

    switch (facility.type) {
      case 'refinery':
        output = this.refine(
          facility.inputResources[0] || { type: ResourceType.IRON, quantity: 0 },
          facility.productionRate,
          facility.efficiency
        );
        break;

      case 'factory':
        output = this.manufacture(
          facility.inputResources,
          facility.productionRate,
          facility.efficiency
        );
        break;

      case 'farm':
        output = {
          type: ResourceType.FOOD,
          quantity: facility.productionRate * (facility.efficiency / 100),
        };
        break;

      case 'research':
        // Research doesn't produce resources, just increases tech
        output = { type: ResourceType.IRON, quantity: 0 };
        break;

      default:
        output = { type: ResourceType.IRON, quantity: 0 };
    }

    // Degrade efficiency over time
    facility.efficiency = Math.max(50, facility.efficiency - 0.1);

    return output;
  }

  /**
   * Calculate total food consumption for a population
   */
  public calculateFoodConsumption(population: number): number {
    // 1 food per 100 population per cycle
    return population / 100;
  }

  /**
   * Calculate worker satisfaction and production penalty
   */
  public calculateProductionPenalty(
    population: number,
    foodAvailable: number,
    wagesPerWorker: number,
    taxRate: number
  ): number {
    const foodConsumption = this.calculateFoodConsumption(population);
    const foodRatio = foodAvailable / (foodConsumption + 1);

    // If population doesn't get enough food and wages, production drops
    const satisfactionPenalty = Math.max(0, (1 - foodRatio) * 0.5);
    const wagesIncome = population * wagesPerWorker;
    const taxesPaid = wagesIncome * (taxRate / 100);
    const disposableincome = wagesIncome - taxesPaid;

    if (disposableincome < wagesPerWorker * 0.3) {
      // Riots might occur at low wages
      return satisfactionPenalty + 0.5;
    }

    return satisfactionPenalty;
  }

  /**
   * Determine substitution chain - if resource is too expensive, use alternative
   */
  public getSubstituteResource(resource: ResourceType, marketPriceRatio: number): ResourceType | null {
    // If resource price goes 2x above base, consider substitutes
    if (marketPriceRatio < 2) return null;

    const substitutes: Record<ResourceType, ResourceType> = {
      [ResourceType.COPPER]: ResourceType.SILVER,
      [ResourceType.SILVER]: ResourceType.COPPER,
      [ResourceType.IRON]: ResourceType.TITANIUM,
      [ResourceType.TITANIUM]: ResourceType.IRON,
      [ResourceType.FUEL]: ResourceType.ANTIMATERIA,
    } as any;

    return substitutes[resource] || null;
  }

  private getRefinedResource(rawResource: ResourceType): ResourceType {
    const refinedMap: Record<ResourceType, ResourceType> = {
      [ResourceType.IRON]: ResourceType.STEEL,
      [ResourceType.COPPER]: ResourceType.ALLOY,
      [ResourceType.SILVER]: ResourceType.CIRCUITS,
      [ResourceType.SILICON]: ResourceType.CIRCUITS,
      [ResourceType.TITANIUM]: ResourceType.ALLOY,
      [ResourceType.GOLD]: ResourceType.CIRCUITS,
      [ResourceType.STEEL]: ResourceType.ALLOY,
      [ResourceType.ALLOY]: ResourceType.CIRCUITS,
      [ResourceType.CIRCUITS]: ResourceType.CIRCUITS,
      [ResourceType.FUEL]: ResourceType.FUEL,
      [ResourceType.ANTIMATERIA]: ResourceType.ANTIMATERIA,
      [ResourceType.FOOD]: ResourceType.FOOD,
      [ResourceType.OXYGEN]: ResourceType.OXYGEN,
      [ResourceType.WATER]: ResourceType.WATER,
    };

    return refinedMap[rawResource] || ResourceType.IRON;
  }

  private getTotalStoredQuantity(warehouse: Warehouse): number {
    return warehouse.stored.reduce((sum, r) => sum + r.quantity, 0);
  }
}
