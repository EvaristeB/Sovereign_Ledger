# Architecture & Systems Guide

## Overview

Sovereign Ledger's architecture follows a **modular, event-driven design** where independent systems coordinate through a central GameEngine.

## System Dependencies

```
GameEngine (orchestrator)
├── MarketSystem
│   └── Prices drive all economic decisions
├── ResourceSystem
│   └── Production, refining, storage
├── LogisticsSystem
│   └── Movement, trade contracts, shipping costs
├── ExplorationSystem
│   └── Universe generation, discovery
├── WarfareSystem
│   └── Combat, blockades, diplomacy
└── EventSystem
    └── Procedural chaos and emergent situations
```

## MarketSystem

**Responsibility**: Manage all price dynamics and market mechanics.

### Key Features
- **Dynamic Pricing**: Price = f(supply, demand, historical_trend)
- **Market Listings**: Player-to-player trading
- **Trend Analysis**: Rising/stable/falling classification
- **Constraints**: Prices bounded 10%-∞ of base value

### Price Elasticity Formula
```
newPrice = basePrice × (demand / (supply + 1))
newPrice = (historicalPrice × 0.7) + (newPrice × 0.3)  // Smoothing
```

### Use Cases
```typescript
// List for sale
market.listForSale(empire, ResourceType.IRON, 5000, locationId, price);

// Execute trade
market.executeTrade(buyerId, listingId, quantity);

// Get market price
market.getMarketPrice(ResourceType.IRON);
```

## ResourceSystem

**Responsibility**: Handle all resource generation, transformation, and consumption.

### Production Chains
```
Mining → Refining → Manufacturing → Distribution
  ↓         ↓           ↓              ↓
Raw ore  Pure metal  Components   Final goods
```

### Key Mechanics
- **Purity Affects Output**: Mining 100 tonnes of 60% pure ore yields only 60 tonnes
- **Efficiency Degrades**: Each production cycle reduces efficiency by 0.1%
- **Equipment Degradation**: Mining rate decreases as deposits exhaust

### Worker Satisfaction
```
Satisfaction = 1.0
            - (1 - foodRatio) × 0.5        // Food shortage penalty
            - satisfactionPenalty           // Low wages/taxes
```

If satisfaction < 0.3, revolts begin.

## LogisticsSystem

**Responsibility**: Manage fleet movement, cargo, trade contracts, and shipping economics.

### Fleet Architecture
```
Fleet
├── Ships: Vessel[]
│   ├── cargo (capacity)
│   ├── type (cargo/fighter/corvette/cruiser/dreadnought)
│   └── health
└── Cargo: Resource[]
```

### Movement Physics
```
Distance = √((x₂-x₁)² + (y₂-y₁)² + (z₂-z₁)²)
Travel Time = distance / shipSpeed

Fuel Cost = distance/100 × (1 + 0.1×fleetSize + cargoWeight/1000)
```

### Route Profitability
```
Profit = (sellPrice × qty) - (buyPrice × qty) - shippingCost
Shipping = distance × weight × 0.001 × (1 - engineTech × 0.01)
```

### Piracy Risk
```
Risk = conflictLevel × 10 + systemsOnRoute × 5
Interception = rand() < (risk/100)
```

## ExplorationSystem

**Responsibility**: Generate procedural universe and manage discoveries.

### Procedural Generation
```
Universe (5 sectors)
└── Sector (5-15 systems per sector)
    └── SolarSystem
        ├── Planets (2-6 per system)
        │   └── Resources (2-4 per planet)
        └── AsteroidBelts (1-3 per system)
            └── Resources (10-30 per belt)
```

### Resource Distribution
- **Asteroids**: ~50,000 tonnes per deposit, 85% purity, 50 tonnes/cycle
- **Terrestrial**: ~200,000 tonnes, 60% purity, 150 tonnes/cycle
- **Rarity**: Gold and Antimateria spawn in 10% of systems

### Discovery Mechanics
```
Scan Cost = tech_level × 100 credits + fuel
Deep Scan = reveals exact quantities (90-95% accuracy)

Discovery Value = (quantity / 1000) × (purity / 100) × basePrice × 0.1
                = 10% of total resource value
```

## WarfareSystem

**Responsibility**: Combat resolution, blockades, and military economics.

### Combat Power Formula
```
Power = Σ(shipBasePower) × (1 + warfareTech × 0.1)

Ship Costs:
- Fighter: 10 power
- Corvette: 50 power
- Cruiser: 200 power
- Dreadnought: 1000 power
```

### Battle Resolution
```
AttackerWinChance = attackPower / (attackPower + defendPower)
Winner = rand() < attackerWinChance ? attacker : defender

Losses:
- Winner: 30% casualties
- Loser: 70% casualties
```

### Blockade Mechanics
```
Blockade Strength = calculateCombatPower(blockadeFleet)
Duration = fixed (e.g., 50 cycles)

Blockade Effect:
- If fleet approaching blockade: 
  - Challenge roll: blockadeStrength vs. fleetPower
  - Win: 50% cargo lost + penalties
  - Lose: Blockade destroyed
```

### War Costs
```
PerCycleCost = 1000 credits (per cycle of war)
Economic Damage = 5% of treasury per cycle
```

## EventSystem

**Responsibility**: Generate emergent situations and chaos that tests strategies.

### Event Types

**Market Events** (5% chance per cycle)
- Market Crash: -20% to -80% price drop
- Shortage: +100% to +200% price increase
- Surplus: -30% to -50% price decrease

**Military Events** (2% chance per cycle)
- NPC Invasion: Forces coalition or exploitation
- Worker Revolt: -50% production on colony
- Pirate Raid: Random fleet attacked

**Diplomatic Events**
- War Declarations: Manual trigger
- Peace Treaties: Negotiated reparations

### Event Effects
```
Event → Effect → Empire State Change
  ↓
Market crashes affect treasury through resource values
Invasions force military spending
Revolts reduce production
```

## GameEngine

**Responsibility**: Orchestrate all systems in a coordinated game loop.

### Game Loop (7 Phases)

```
Cycle N
│
├─ Phase 1: PRODUCTION
│   └── Factories, mines produce resources
│
├─ Phase 2: MARKET
│   └── Update prices based on supply/demand
│
├─ Phase 3: LOGISTICS
│   └── Move fleets, consume fuel
│
├─ Phase 4: TRADES
│   └── Complete delivery contracts
│
├─ Phase 5: EVENTS
│   └── Generate/process random events
│
├─ Phase 6: FINANCE
│   └── Tax income, pay maintenance, bankruptcy check
│
├─ Phase 7: TECH
│   └── Spend budget on research
│
└─ Publish State to Clients
```

### Empire State
```
Empire
├── Treasury (credits)
├── Resources[]
├── Fleets[]
├── Colonies[]
├── TradeContracts[]
└── TechLevels
    ├── Mining (affects mining rate)
    ├── Refining (affects refining efficiency)
    ├── Manufacturing (affects production)
    ├── Navigation (affects travel speed)
    ├── Warfare (affects combat power)
    └── Economy (affects trading capacity)
```

## Data Flow Diagram

```
Market Activity (trades, listings)
    ↓
MarketSystem calculates new prices
    ↓
ResourceSystem adjusts production
    ↓
LogisticsSystem routes shipments
    ↓
Empire State updates
    ↓
EventSystem generates chaos
    ↓
GameEngine broadcasts to clients
```

## Performance Considerations

### Scalability
- **Time Dilation**: Cycles can run at 1x, 10x, 100x speed
- **Distributed Computing**: Each system could run on separate processes
- **Lazy Evaluation**: Only compute affected empires per phase
- **Caching**: Market prices cached between updates

### Optimization Opportunities
- Spatial indexing for fleet queries (R-tree)
- Event culling for distant empires
- Batch trading in off-peak cycles
- Procedural asset caching

## Extension Points

### Adding New Resources
1. Add to `ResourceType` enum
2. Add base price to `MarketSystem.initializeMarketPrices()`
3. Add substitutes to `ResourceSystem.getSubstituteResource()`

### Adding New Events
1. Extend `EventSystem.generateRandomEvent()`
2. Define event effect in `EventSystem.processEventEffects()`
3. Broadcast via Socket.IO

### Adding New Ship Types
1. Extend `Vessel.type` union
2. Add power calculation in `WarfareSystem.calculateCombatPower()`
3. Add cargo capacity in fleet definition

### Adding New Production Chains
1. Extend `ProductionFacility.type`
2. Add production logic to `ResourceSystem.produceInCycle()`
3. Define input/output resources

---

**Design Principle**: *Autonomy with Coordination*

Each system operates independently with its own rules, but they coordinate through the GameEngine and shared data structures. This allows for complex emergent behavior while remaining testable and maintainable.
