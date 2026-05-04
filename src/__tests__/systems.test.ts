import { MarketSystem } from '../systems/MarketSystem';
import { ResourceSystem } from '../systems/ResourceSystem';
import { LogisticsSystem } from '../systems/LogisticsSystem';
import { ExplorationSystem } from '../systems/ExplorationSystem';
import { ResourceType } from '../types';

describe('Market System', () => {
  let market: MarketSystem;

  beforeEach(() => {
    market = new MarketSystem();
  });

  test('should initialize market prices', () => {
    const ironPrice = market.getMarketPrice(ResourceType.IRON);
    expect(ironPrice.resource).toBe(ResourceType.IRON);
    expect(ironPrice.price).toBeGreaterThan(0);
    expect(ironPrice.trend).toBe('stable');
  });

  test('should calculate price based on supply and demand', () => {
    const supply = new Map<ResourceType, number>([[ResourceType.IRON, 100000]]);
    const demand = new Map<ResourceType, number>([[ResourceType.IRON, 500000]]);

    market.updateMarketCycle(supply, demand);
    const newPrice = market.getMarketPrice(ResourceType.IRON);

    expect(newPrice.trend).toBe('rising');
    expect(newPrice.price).toBeGreaterThan(100);
  });
});

describe('Resource System', () => {
  let resources: ResourceSystem;

  beforeEach(() => {
    resources = new ResourceSystem();
  });

  test('should calculate food consumption correctly', () => {
    const population = 10000;
    const consumption = resources.calculateFoodConsumption(population);
    expect(consumption).toBe(population / 100);
  });

  test('should identify substitutes for expensive resources', () => {
    const substitute = resources.getSubstituteResource(ResourceType.COPPER, 2.5);
    expect(substitute).toBe(ResourceType.SILVER);
  });

  test('should not suggest substitute if price ratio is low', () => {
    const substitute = resources.getSubstituteResource(ResourceType.COPPER, 1.5);
    expect(substitute).toBeNull();
  });
});

describe('Logistics System', () => {
  let logistics: LogisticsSystem;

  beforeEach(() => {
    logistics = new LogisticsSystem();
  });

  test('should calculate travel time between coordinates', () => {
    const from = { x: 0, y: 0, z: 0 };
    const to = { x: 100, y: 0, z: 0 };
    const time = logistics.calculateTravelTime(from, to, 100);

    expect(time).toBeGreaterThan(0);
    expect(time).toBeLessThanOrEqual(2);
  });

  test('should calculate fuel consumption', () => {
    const fuel = logistics.calculateFuelConsumption(1000, 5, 500);
    expect(fuel).toBeGreaterThan(0);
  });

  test('should calculate shipping cost', () => {
    const cost = logistics.calculateShippingCost(1000, 500, 2);
    expect(cost).toBeGreaterThan(0);
  });

  test('should estimate trade profit', () => {
    const profit = logistics.estimateTradeProfit(100, 150, 1000, 500, 100, 3);
    expect(profit).toBeGreaterThan(0); // Should be profitable
  });
});

describe('Exploration System', () => {
  let exploration: ExplorationSystem;

  beforeEach(() => {
    exploration = new ExplorationSystem();
  });

  test('should generate a sector with systems', () => {
    const sector = exploration.generateSector('sector_1', 'Test Sector', 0, 0, 0);

    expect(sector.id).toBe('sector_1');
    expect(sector.name).toBe('Test Sector');
    expect(sector.systems.length).toBeGreaterThan(0);
  });

  test('each system should have planets', () => {
    const sector = exploration.generateSector('sector_1', 'Test Sector', 0, 0, 0);
    const system = sector.systems[0];

    expect(system.planets.length).toBeGreaterThan(0);
  });

  test('each planet should have resource deposits', () => {
    const sector = exploration.generateSector('sector_1', 'Test Sector', 0, 0, 0);
    const planet = sector.systems[0].planets[0];

    expect(planet.resources.length).toBeGreaterThan(0);
    expect(planet.resources[0].quantity).toBeGreaterThan(0);
    expect(planet.resources[0].purity).toBeGreaterThan(0);
  });
});
