# Sovereign Ledger

**Empire by Flux, Conquest by the Count**

A revolutionary 4X space strategy game where **the economy IS the gameplay**. Not a simulation of combat with a shop menu—a simulation of economic power where the laser cannon is just one tool of negotiation among many.

## Vision

Sovereign Ledger is built on a single principle: **every action has immediate economic consequences that ripple across the galaxy**. Mine an asteroid, destabilize a competitor's supply chain. Destroy a cargo ship, trigger a market shortage. Discover a resource deposit, reshape trade routes and profit margins.

The player who understands that **war is won through wallet dominance**—not firepower—will emerge victorious.

## Core Mechanics

### 1. **Organic Supply & Demand**
- Every colony, station, and player has unique needs
- Market prices fluctuate based on real supply/demand
- Resource substitution creates dynamic trade opportunities
- Interdependence chains mean breaking one link stops everything

### 2. **Economic Warfare**
- **Blockades**: Starve sectors through shipping chokepoints
- **Piracy**: Hire rebels to attack competitors' trade routes
- **Market manipulation**: Flood markets with resources to crash prices
- **Reparation treaties**: Force economic surrender through diplomatic terms

### 3. **Logistics Mastery**
- Physical trade routes with real ship movements
- Fleet composition, fuel consumption, cargo capacity constraints
- Risk management: insurance vs. piracy exposure
- Route optimization for maximum profit flow

### 4. **Multi-Path Victory**
- **Monopoly**: Control 90% of a vital resource
- **Cultural Dominance**: Make your products indispensable across the galaxy
- **Economic Supremacy**: Literally buy your enemies' surrender
- **Technological Advantage**: Make competitors' manufacturing impossibly expensive

## Project Structure

```
sovereign-ledger/
├── src/
│   ├── types/              # Core game types and interfaces
│   │   └── index.ts
│   ├── systems/            # Game systems (market, logistics, etc.)
│   │   ├── MarketSystem.ts
│   │   ├── ResourceSystem.ts
│   │   ├── LogisticsSystem.ts
│   │   ├── ExplorationSystem.ts
│   │   ├── WarfareSystem.ts
│   │   └── EventSystem.ts
│   ├── services/           # Core game engine
│   │   └── GameEngine.ts
│   ├── api/                # HTTP/WebSocket API
│   │   └── GameAPI.ts
│   ├── utils/              # Utility functions
│   └── index.ts            # Server entry point
├── dist/                   # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start the game server
npm start
```

The server will start on `http://localhost:3000` with WebSocket support.

### Development

```bash
# Watch TypeScript compilation
npm run watch

# Start in dev mode with ts-node
npm run dev
```

## System Overview

### Market System
- **Dynamic pricing** based on supply/demand elasticity
- **Market listings** for direct player-to-player trades
- **Price history** tracking for trend analysis
- **Resource substitution** when prices get too extreme

### Resource System
- **Mining** from planets and asteroid deposits with purity variation
- **Refining** raw materials into processed goods
- **Manufacturing** multi-stage production chains
- **Storage** with capacity constraints creating scarcity dynamics
- **Workforce satisfaction** affecting production efficiency

### Logistics System
- **Fleet movement** with physics-based travel time
- **Cargo loading/unloading** with capacity management
- **Trade contracts** with delivery requirements
- **Fuel consumption** as operating cost
- **Piracy risk assessment** on routes
- **Profit estimation** for trade ventures

### Exploration System
- **Procedurally generated universe** with sectors and star systems
- **Resource deposit discovery** with varying purity
- **System valuation** for expansion decisions
- **Exclusive discovery data** that can be sold for profit
- **Deep scans** for detailed resource information

### Warfare System
- **Fleet combat** with ship classes and upgradeable tech
- **Blockades** creating economic chokepoints
- **Peace treaties** with reparation terms
- **Military threat assessment** for decision-making
- **Pirate raids** creating ongoing security costs

### Event System
- **Market crashes** and shortages
- **NPC invasions** forcing coalition building
- **Worker revolts** from poor conditions
- **War declarations** between players
- **Procedural chaos** that tests empire resilience

### Game Engine
- **Multi-phase cycle** processing (production → market → logistics → trades → events → finance → tech)
- **Real-time tick** simulating concurrent play
- **Game state management** tracking all empires, resources, fleets
- **Event broadcasting** to all connected players

## API Reference

### HTTP Endpoints

- `GET /health` - Server health check
- `GET /api/game/state` - Current game state snapshot
- `GET /api/market/:resource` - Info for specific resource
- `GET /api/events` - All active events
- `POST /api/game/toggle-pause` - Pause/resume simulation

### WebSocket Events

**Client → Server:**
- `join_game` - Enter the game with empire data
- `subscribe_updates` - Subscribe to broadcast updates
- `create_fleet` - Create a new fleet
- `list_for_sale` - Create market listing
- `get_market` - Fetch market listings for resource
- `buy_discovery` - Purchase discovery information
- `declare_war` - Declare war on another empire
- `blockade_route` - Establish trade route blockade

**Server → Client:**
- `game_joined` - Confirms empire created
- `game_state` - Initial game state
- `state_update` - Periodic game state updates
- `market_listing` - New market listing created
- `fleet_created` - New fleet spawned
- `discovery_purchased` - Discovery was purchased
- `war_declared` - War declared between empires
- `blockade_established` - Blockade placed
- `game_update` - Periodic updates with events

## Game Loop Phases

Each cycle executes in order:

1. **Production Phase** - Factories, mines, farms produce resources
2. **Market Phase** - Prices update based on supply/demand
3. **Logistics Phase** - Fleets move, consume fuel
4. **Trade Execution** - Contracts complete deliveries
5. **Event Phase** - Random events and emergent chaos
6. **Finance Phase** - Income collected, costs paid, bankruptcy checked
7. **Technology Phase** - Research budgets advance tech levels

## Strategy Tips

- **Early Game**: Focus on efficient resource extraction and establishing supply chains
- **Growth**: Diversify energy sources and create redundant routes
- **Mid Game**: Start manipulation via market flooding or supply chain disruption
- **Late Game**: Leverage monopoly positions or military advantage for surrender deals
- **Economic Dominance**: Make competitors' survival mathematically impossible through price control

## Future Roadmap

- [ ] Client UI (web-based live dashboard)
- [ ] Procedural map persistence
- [ ] AI opponent empires
- [ ] Diplomatic systems (embassies, treaties, spying)
- [ ] Advanced taxation and trade policies
- [ ] Guild/corp mechanics
- [ ] Seasonal events and tournaments
- [ ] Analytics and post-game statistics
- [ ] Content expansion (more resources, buildings, techs)

## Architecture Philosophy

**Modular System Design**: Each game system (Market, Resources, Logistics, etc.) operates independently but coordinates through the GameEngine, enabling:
- Easy testing and debugging
- Straightforward to add new mechanics
- Clear separation of concerns
- Potential for distributed processing

**Real-time Simulation**: The game loop runs every 2 seconds by default (configurable), creating genuinely emergent gameplay where actions ripple through interconnected systems automatically.

**Data-Driven Economy**: All pricing, production, and mechanics flow from market data—nothing is hardcoded. This enables fascinating scenarios where players discover and exploit economic truths about the simulation.

## License

This project is the intellectual property of Evariste B. Use and modification for personal projects only.

---

**Remember**: In Sovereign Ledger, you don't win wars—you make them unaffordable for your enemies.