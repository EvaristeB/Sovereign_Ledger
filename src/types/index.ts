// Core game types
export enum ResourceType {
  // Base materials
  IRON = 'iron',
  COPPER = 'copper',
  SILVER = 'silver',
  SILICON = 'silicon',
  TITANIUM = 'titanium',
  GOLD = 'gold',
  
  // Processed materials
  STEEL = 'steel',
  ALLOY = 'alloy',
  CIRCUITS = 'circuits',
  
  // Energy/Fuel
  FUEL = 'fuel',
  ANTIMATERIA = 'antimateria',
  
  // Special
  FOOD = 'food',
  OXYGEN = 'oxygen',
  WATER = 'water'
}

export interface Resource {
  type: ResourceType;
  quantity: number; // in tonnes
  purity?: number; // 0-100, for raw materials
}

export interface Coordinate {
  x: number;
  y: number;
  z: number;
}

export interface Sector {
  id: string;
  name: string;
  coordinate: Coordinate;
  systems: SolarSystem[];
}

export interface SolarSystem {
  id: string;
  name: string;
  coordinate: Coordinate;
  sectorId: string;
  planets: Planet[];
  asteroidBelts: AsteroidBelt[];
}

export interface Planet {
  id: string;
  name: string;
  systemId: string;
  type: 'terrestrial' | 'gas_giant' | 'ice';
  resources: ResourceDeposit[];
  population: number;
  colonized: boolean;
  ownerId?: string;
}

export interface AsteroidBelt {
  id: string;
  systemId: string;
  resources: ResourceDeposit[];
  degradation: number; // 0-100, increases as mined
}

export interface ResourceDeposit {
  id: string;
  resource: ResourceType;
  quantity: number;
  purity: number; // 0-100
  miningRate: number; // tonnes/cycle
  discovered: boolean;
  discoveredBy?: string;
}

export interface Empire {
  id: string;
  name: string;
  playerId: string;
  colonies: string[]; // planet IDs
  treasury: number; // credits
  resources: Resource[];
  fleets: Fleet[];
  contracts: TradeContract[];
  technology: TechLevel;
}

export interface Colony {
  id: string;
  planetId: string;
  empireId: string;
  population: number;
  productionChain: ProductionFacility[];
  warehouses: Warehouse[];
  groundDefense: number;
}

export interface ProductionFacility {
  id: string;
  type: 'refinery' | 'factory' | 'farm' | 'research';
  colonyId: string;
  inputResources: Resource[];
  outputResource: ResourceType;
  productionRate: number;
  efficiency: number; // 0-100
}

export interface Warehouse {
  id: string;
  colonyId: string;
  capacity: number;
  stored: Resource[];
}

export interface Fleet {
  id: string;
  empireId: string;
  ships: Vessel[];
  currentLocation: Coordinate;
  destination?: Coordinate;
  cargo: Resource[];
}

export interface Vessel {
  id: string;
  type: 'cargo' | 'fighter' | 'corvette' | 'cruiser' | 'dreadnought';
  fleetId: string;
  health: number;
  maxHealth: number;
  cargo: number; // tonnes
}

export interface TradeContract {
  id: string;
  buyerId: string;
  sellerId: string;
  resource: ResourceType;
  quantity: number;
  pricePerUnit: number;
  deliveryLocation: Coordinate;
  dueDate: number;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  transportFleetId?: string;
}

export interface MarketListing {
  id: string;
  resourceType: ResourceType;
  locationId: string; // station or colony
  sellerEmpireId: string;
  quantity: number;
  pricePerUnit: number;
  expiresAt: number;
}

export interface MarketPrice {
  resource: ResourceType;
  price: number;
  trend: 'rising' | 'stable' | 'falling';
  history: number[]; // last 100 prices
}

export interface TechLevel {
  mining: number;
  refining: number;
  manufacturing: number;
  navigation: number;
  warfare: number;
  economy: number;
}

export interface TradeRoute {
  id: string;
  empireId: string;
  origin: Coordinate;
  destination: Coordinate;
  resource: ResourceType;
  frequency: number; // shipments per cycle
  active: boolean;
}

export interface GameState {
  cycle: number;
  paused: boolean;
  empires: Map<string, Empire>;
  sectors: Sector[];
  marketPrices: Map<ResourceType, MarketPrice>;
  tradeRoutes: TradeRoute[];
}

export interface GameEvent {
  id: string;
  type: 'market_crash' | 'discovery' | 'invasion' | 'shortage' | 'surplus' | 'revolt' | 'war_declared';
  timestamp: number;
  affectedEmpires: string[];
  data: Record<string, unknown>;
}
