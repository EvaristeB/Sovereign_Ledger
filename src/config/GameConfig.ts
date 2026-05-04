/**
 * Game Configuration Constants
 * Adjust these to balance gameplay
 */

export const GameConfig = {
  // Game Loop
  GAME_CYCLE_INTERVAL_MS: 2000, // 2 seconds per cycle
  GAME_SPEED_MULTIPLIER: 1, // Can accelerate with Time Dilation

  // Economy
  STARTING_TREASURY: 100000,
  BASE_RESOURCE_PRICES: {
    IRON: 100,
    COPPER: 150,
    SILVER: 500,
    SILICON: 200,
    TITANIUM: 800,
    GOLD: 2000,
    STEEL: 300,
    ALLOY: 600,
    CIRCUITS: 1500,
    FUEL: 250,
    ANTIMATERIA: 10000,
    FOOD: 50,
    OXYGEN: 75,
    WATER: 30,
  },

  // Market
  PRICE_SMOOTHING_RATIO: 0.7, // % weight to historical price
  PRICE_FLOOR_RATIO: 0.1, // Minimum price = base * this
  MARKET_LISTING_DURATION_MS: 7 * 24 * 60 * 60 * 1000, // 7 days

  // Production
  MINING_DEGRADATION_PER_CYCLE: 0.02, // 2% purity loss per cycle
  EQUIPMENT_DEGRADATION_PER_CYCLE: 0.02, // 2% mining rate loss
  PRODUCTION_EFFICIENCY_FLOOR: 50, // Minimum 50% efficiency

  // Logistics
  FLEET_BASE_SPEED: 100, // Units per cycle
  FUEL_CONSUMPTION_BASE: 0.01, // Per 1 distance unit
  FLEET_SIZE_FUEL_MODIFIER: 0.1, // 10% extra fuel per ship
  CARGO_WEIGHT_FUEL_MODIFIER: 0.001, // Per tonne
  PIRACY_BASE_RISK: 5, // % per system on route
  SHIPPING_COST_RATIO: 0.001, // Base cost ratio

  // Exploration
  DISCOVERY_VALUE_RATIO: 0.1, // 10% of resource value
  SCAN_COST: 100, // Credits per scan
  DEEP_SCAN_ACCURACY: 0.95, // 95% accurate

  // Empire & Colonies
  TAX_INCOME_PER_COLONY: 1000, // Credits per cycle
  COLONY_MAINTENANCE_COST: 500, // Credits per cycle
  FLEET_MAINTENANCE_COST: 500, // Per fleet per cycle
  POPULATION_FOOD_RATIO: 100, // 1 food per 100 population

  // Technology
  RESEARCH_BUDGET_RATIO: 0.01, // 1% of treasury to research
  TECH_ADVANCEMENT_RATE: 0.01, // 0.01 per cycle
  TECH_COMBAT_BONUS_PER_LEVEL: 0.1, // 10% per level
  TECH_TRAVEL_BONUS_PER_LEVEL: 0.1, // 10% faster per level

  // Warfare
  BLOCKADE_EFFECTIVENESS_RATIO: 0.5, // 50% cargo loss when intercepted
  WAR_COST_PER_CYCLE: 1000, // Credits per cycle of war
  WAR_ECONOMIC_DAMAGE_RATIO: 0.05, // 5% of treasury per cycle
  COMBAT_CASUALTY_WINNER: 0.3, // 30% of winner's fleet lost
  COMBAT_CASUALTY_LOSER: 0.7, // 70% of loser's fleet lost

  // Ships
  SHIP_POWER: {
    fighter: 10,
    corvette: 50,
    cruiser: 200,
    dreadnought: 1000,
    cargo: 0,
  },

  // Events
  EVENT_MARKET_CRASH_CHANCE: 0.02, // 2% per cycle
  EVENT_SHORTAGE_CHANCE: 0.03, // 3% per cycle
  EVENT_INVASION_CHANCE: 0.01, // 1% per cycle
  MARKET_CRASH_SEVERITY: {
    MINOR: 0.2, // 20% price drop
    MODERATE: 0.5, // 50% drop
    SEVERE: 0.8, // 80% drop
  },

  // Victory Conditions
  MONOPOLY_THRESHOLD: 0.9, // 90% to win
  ECONOMIC_SUPREMACY_THRESHOLD: 5000000, // 5 million credits
  CULTURAL_SATURATION_THRESHOLD: 0.9, // 90% of galaxy using product

  // Universe Generation
  STARTING_SECTORS: 5,
  SYSTEMS_PER_SECTOR: { MIN: 5, MAX: 15 },
  PLANETS_PER_SYSTEM: { MIN: 2, MAX: 6 },
  ASTEROID_BELTS_PER_SYSTEM: { MIN: 1, MAX: 3 },
  RESOURCES_PER_PLANET: { MIN: 2, MAX: 4 },
  RESOURCES_PER_BELT: { MIN: 10, MAX: 30 },

  // Resource Generation
  ASTEROID_QUANTITY_BASE: 50000,
  ASTEROID_PURITY_BASE: 85,
  ASTEROID_MINING_RATE_BASE: 50,

  TERRESTRIAL_QUANTITY_BASE: 200000,
  TERRESTRIAL_PURITY_BASE: 60,
  TERRESTRIAL_MINING_RATE_BASE: 150,

  // Difficulty Modifiers (adjust for player skill)
  DIFFICULTY: {
    EASY: {
      STARTING_TREASURY_MULTIPLIER: 2,
      TECH_ADVANCEMENT_MULTIPLIER: 2,
      MARKET_VOLATILITY_MULTIPLIER: 0.5,
    },
    NORMAL: {
      STARTING_TREASURY_MULTIPLIER: 1,
      TECH_ADVANCEMENT_MULTIPLIER: 1,
      MARKET_VOLATILITY_MULTIPLIER: 1,
    },
    HARD: {
      STARTING_TREASURY_MULTIPLIER: 0.5,
      TECH_ADVANCEMENT_MULTIPLIER: 0.5,
      MARKET_VOLATILITY_MULTIPLIER: 2,
    },
  },
};

export default GameConfig;
