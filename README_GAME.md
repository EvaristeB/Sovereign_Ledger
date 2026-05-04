# ⚡ SOVEREIGN LEDGER ⚡

## *Empire by Flux, Conquest by the Count*

A sophisticated **4X Economic Strategy Game** where **economy IS the gameplay**. Command galactic empires in a procedurally-generated universe where market dominance, diplomatic intrigue, and technological superiority determine victory.

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Status](https://img.shields.io/badge/Status-Alpha-yellow.svg)
![Version](https://img.shields.io/badge/Version-0.2.0-blue.svg)

---

## 🎮 Gameplay Overview

### Core Systems

**Sovereign Ledger** implements 11 integrated game systems:

1. **Market System** - Dynamic commodity trading with supply/demand elasticity
2. **Resource System** - Mining, refining, manufacturing, production chains
3. **Logistics System** - Fleet movement, cargo management, trade contracts
4. **Exploration System** - Procedural sector generation, system discovery
5. **Warfare System** - Combat mechanics, blockades, military treaties
6. **Event System** - 10+ procedurally-triggered events creating drama
7. **Futures System** - Speculation market for leveraged trading
8. **Diplomacy System** - Alliances, embargoes, tributes, relations
9. **Galactic Council** - Voting, law proposals, economic regulation
10. **Persistence** - Save/load with auto-save and backups
11. **Game Engine** - Central orchestrator running 7-phase cycles

### Victory Conditions

Win through:
- 💰 **Economic Dominance** - Control 40%+ of galactic market
- 🤝 **Diplomatic Hegemony** - Form largest alliance network
- ⚔️ **Military Conquest** - Blockade and subjugate rivals
- 🔬 **Technological Supremacy** - Reach tech level 10 in all fields
- 🏛️ **Political Control** - Dominate Galactic Council voting

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Modern web browser

### Installation

```bash
# Clone repository
git clone https://github.com/your-repo/sovereign-ledger.git
cd sovereign-ledger

# Install dependencies
npm install
cd ui && npm install && cd ..

# Start both servers
./start.sh

# Or run manually:
# Terminal 1:
npm start              # Backend on :3000

# Terminal 2:
cd ui && npm run dev   # Frontend on :5173
```

### Access the Game

Open your browser to: **http://localhost:5173**

---

## 📊 Game Features

### Economy System
- **Real-time Market** - Prices adjust dynamically based on supply/demand
- **Production Chains** - Raw materials → refined goods → equipment
- **Resource Scarcity** - Limited supply creates strategic tension
- **Futures Trading** - Speculate on future commodity prices
- **Monopoly Control** - Form cartels to manipulate markets

### Strategic Gameplay
- **Tech Tree** - 10 technology paths to research
- **Fleet Management** - Build and command military/cargo vessels
- **Exploration** - Discover valuable star systems
- **Blockades** - Starve enemies of resources
- **Economic Warfare** - Trade embargoes, sanctions, tributes

### Diplomacy & Intrigue
- **Relationship System** - Track -100 to +100 diplomatic scores
- **Alliance Formation** - Mutual defense pacts with bonuses
- **Trade Embargoes** - Block rivals from market access
- **Tribute Demands** - Extract wealth from weaker empires
- **Galactic Council** - Democratic law-making with voting power

### Events & Emergent Drama
- **Solar Storms** - Disrupt supply chains, damage infrastructure
- **Asteroid Impacts** - Temporary production decrease
- **Worker Strikes** - Labor unrest reduces output
- **Black Swan Events** - Market crashes and price spikes
- **Pirate Activity** - Rogue fleets attack trade routes
- **Recession Cycles** - Economy-wide downturns
- **Espionage** - Discovery of covert operations

### Real-time Multiplayer
- **Live Economy** - All players see same market prices
- **Trading** - Direct player-to-player commerce
- **Diplomacy** - Cross-player alliances and negotiations
- **Warfare** - Military engagement between fleets
- **Shared Events** - World events affect everyone

---

## 🛠️ Technical Architecture

### Backend
```
TypeScript/Node.js with Express & Socket.io
11 game systems running on 2-second tick cycle
File-based persistence (PostgreSQL-ready)
Real-time WebSocket updates to all clients
```

### Frontend
```
React 18 with TypeScript
Vite bundler (ultra-fast dev experience)
Recharts for real-time data visualization
TailwindCSS + custom game aesthetics
Socket.io-client for real-time sync
```

### Full Stack
```
Backend:  http://localhost:3000 (Express server)
Frontend: http://localhost:5173 (Vite dev server)
Proxy: Frontend proxies API to backend
Real-time: WebSocket tunnel through proxy
```

---

## 📁 Project Structure

```
sovereign-ledger/
├── src/                           # Backend TypeScript
│   ├── systems/                   # Game systems (11 modules)
│   │   ├── GameEngine.ts         # Central orchestrator
│   │   ├── MarketSystem.ts       # Economic simulation
│   │   ├── ResourceSystem.ts     # Production & mining
│   │   ├── LogisticsSystem.ts    # Fleet & cargo
│   │   ├── ExplorationSystem.ts  # Procedural galaxy
│   │   ├── WarfareSystem.ts      # Combat mechanics
│   │   ├── EventSystem.ts        # Random events
│   │   ├── EventSystem_v2.ts     # Enhanced events
│   │   ├── FuturesSystem.ts      # Speculation market
│   │   ├── DiplomacySystem.ts    # Diplomatic tools
│   │   └── GalacticCouncilSystem.ts # Voting
│   ├── services/
│   │   ├── GameAPI.ts            # WebSocket endpoints
│   │   └── PersistenceService.ts # Save/load system
│   ├── index.ts                  # Express server entry
│   └── types.ts                  # TypeScript interfaces
├── ui/                            # Frontend React
│   ├── src/
│   │   ├── components/           # 5 React components
│   │   │   ├── App.tsx           # Main app shell
│   │   │   ├── Dashboard.tsx     # Stats & overview
│   │   │   ├── MarketOverview.tsx # Trading interface
│   │   │   ├── FleetManager.tsx  # Fleet management
│   │   │   ├── DiplomacyPanel.tsx # Diplomacy UI
│   │   │   └── EventsFeed.tsx    # Event stream
│   │   ├── styles/               # CSS modules
│   │   ├── index.css             # Global styles
│   │   └── main.tsx              # React entry
│   ├── index.html                # HTML template
│   ├── vite.config.ts            # Vite configuration
│   ├── tsconfig.json             # TypeScript config
│   └── package.json              # Frontend deps
├── package.json                  # Backend deps
├── start.sh                       # Launch script
├── GAME_STATUS.md               # Detailed status report
└── README.md                     # This file
```

---

## 🎯 Game Balance

### Starting Resources
- **Credits**: 100,000
- **Colonies**: 3 (randomly positioned)
- **Fleets**: 1 (5 ships)
- **Technologies**: Base level 1

### Economic Parameters
- **Market Price Range**: -20% to +40% per cycle
- **Production Efficiency**: 85-95% base
- **Resource Capacity**: 1,000 tonnes per colony
- **Trade Margins**: 5-15% profit on resale

### Diplomacy Values
- **Alliance Bonus**: +15% market access, +20 relationship
- **Embargo Penalty**: -30% market access, -20 relationship
- **Tribute Amount**: 100-1000 credits/cycle variable
- **Relationship Decay**: -1 per cycle (peace timescale)

### Military Strength
- **Fleet Power**: Ships × 10 firepower value
- **Combat Resolution**: Rock-paper-scissors + RNG
- **Blockade Efficiency**: 80% resource denial
- **Peace Treaty**: Mandatory 10-cycle truce

### Research & Technology
- **Max Level**: 10 per technology
- **Cost Scaling**: Exponential (doubles per level)
- **Benefit per Level**: 10% improvement
- **Fields**: Engineering, Economics, Military, Diplomacy

---

## 🎮 How to Play

### Turn 1: Economic Expansion
1. Mine resources from colonies
2. Refine raw materials
3. Manufacture goods
4. Sell on galactic market for profit

### Turn 2: Strategic Growth
1. Research new technologies
2. Build production facilities
3. Expand to new sectors
4. Form trade partnerships

### Turn 3: Political Maneuvering
1. Propose alliances with profitable empires
2. Negotiate tribute arrangements
3. Propose Galactic Council laws
4. Vote on economic regulations

### Turn 4: Market Dominance
1. Speculate on futures contracts
2. Create cartels with allies
3. Embargo competitors
4. Accumulate market share

### Winning Move
- Achieve 40%+ market share, OR
- Control Galactic Council majority, OR
- Build largest alliance network, OR
- Reach tech level 10 in all fields, OR
- Eliminate all competitors militarily

---

## 📈 Development Status

| Component | Status | Coverage |
|-----------|--------|----------|
| Backend Systems | ✅ Complete | 11/11 |
| UI Components | ✅ Complete | 5/5 |
| Game Loop | ✅ Complete | 7-phase cycle |
| Multiplayer | ✅ Complete | Real-time sync |
| Persistence | ✅ Complete | Save/Load/Auto-save |
| Styling | ✅ Complete | Game aesthetic |
| Build System | ✅ Complete | Vite + TypeScript |
| **Total Completion** | **✅ 95%** | **Feature-complete** |

### Remaining Tasks
- Galaxy 3D visualization (optional)
- AI player opponents (bonus)
- Sound effects (bonus)
- Mobile optimization (ongoing)

---

## 🔧 Building for Production

### Build Frontend
```bash
cd ui
npm run build
# Output: ./dist/ folder with production bundle
```

### Build Backend
```bash
npm run build
# Output: ./dist/ folder with compiled JavaScript
```

### Docker Deployment
```bash
# Build image
docker build -t sovereign-ledger .

# Run container
docker run -p 3000:3000 -p 5173:5173 sovereign-ledger
```

---

## 📚 API Documentation

### WebSocket Events

#### Client → Server
```typescript
// Join game
emit('join_game', { playerId, empireData }, callback)

// Get empire status
emit('get_empire_status', callback)

// Trade on market
emit('list_for_sale', { resource, quantity, price })
emit('buy_listing', { listingId, quantity })

// Fleet commands
emit('create_fleet', { location, ships })
emit('move_fleet', { fleetId, destination })
emit('load_cargo', { fleetId, resource, quantity })

// Diplomacy
emit('propose_diplomacy', { type, targetEmpire, terms })
emit('vote_on_proposal', { proposalId, vote })

// Subscribe
emit('subscribe_updates')
```

#### Server → Client
```typescript
// Broadcast game state
on('game_update', data)

// Trading updates
on('market_listing', data)
on('trade_executed', data)

// Fleet updates
on('fleet_created', data)
on('fleet_moved', data)
on('cargo_loaded', data)

// Diplomacy updates
on('diplomacy_proposed', data)
on('alliance_formed', data)
on('embargo_enacted', data)

// Events
on('event_triggered', data)
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

### Frontend won't connect
```bash
# Check backend is running on :3000
curl http://localhost:3000/health

# Check CORS headers
# Browser console should show WebSocket connection
```

### TypeScript errors
```bash
npm run build  # Full compile check
tsc --noEmit   # Type-checking only
```

### High CPU/Memory usage
```bash
# ProfileX the event loop
node --prof src/index.js

# Check for memory leaks
node --inspect src/index.js
# Open chrome://inspect in Chrome DevTools
```

---

## 📖 Configuration

### Backend Environment
```env
PORT=3000
NODE_ENV=development|production
GAME_TICK_MS=2000
AUTO_SAVE_INTERVAL=300000
LOG_LEVEL=debug|info|warn|error
DATABASE_URL=file:./game.db  # or PostgreSQL
```

### Frontend Environment
```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
VITE_DEBUG=true|false
```

---

## 🎓 Learning Resources

### Understanding the Economy System
- See `src/systems/MarketSystem.ts` for price calculation
- Study price elasticity formula: `newPrice = basePrice × (1 + demand - supply)`

### Implementing Custom Events
- Extend `EventSystem.ts` with new event triggers
- Hook into `GameEngine.executeCycle()` for event processing

### Adding UI Components
- Create React component in `ui/src/components/`
- Connect Socket.io listener in `useEffect()`
- Add CSS module in `ui/src/styles/`
- Import in `App.tsx` and add navigation tab

### Multiplayer Debugging
- Open 2+ browser windows to localhost:5173
- Both connect to same backend server
- Real-time events sync across windows
- Test market trades, diplomacy proposals

---

## 📝 Design Philosophy

> "Economy IS the Gameplay"

Sovereign Ledger rejects the traditional 4X formula where military might dominates. Instead:

- **Economic systems drive everything** - Control resources to fund expansion
- **Markets create tension** - Prices fluctuate, creating opportunities and risks
- **Emergent complexity** - Simple systems interact to create deep strategy
- **Multiplayer drama** - Other players create unpredictability and fun
- **Victory flexibility** - Multiple paths to dominance, no single "best" strategy

### Design Goals Met ✅
1. ✅ Economy-first gameplay
2. ✅ Real-time multiplayer
3. ✅ Procedural galaxy generation
4. ✅ Political victory through Galactic Council
5. ✅ Speculative market mechanics
6. ✅ Emergent events and drama
7. ✅ Clean, responsive game UI
8. ✅ Accessible strategy gameplay

---

## 🤝 Contributing

Contributions welcome! Areas for improvement:

- Galaxy map visualization (3D/2D)
- AI opponent players
- Additional event types
- Performance optimizations
- Mobile responsiveness
- Sound design and audio
- Accessibility improvements

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🎉 Credits

**Design Document**: Note d'Intention - Comprehensive 10-section game design spec  
**Backend Implementation**: TypeScript/Node.js game engine with 11 systems  
**Frontend Implementation**: React 18 + Vite UI with Recharts visualization  
**Special Thanks**: To emerging game design principles and economic simulation theory

---

## 🚀 Roadmap

### v0.3 (Next)
- Galaxy 3D visualization with Babylon.js
- AI player opponents
- Tournament/campaign mode
- Achievement system

### v0.4
- Mobile app (React Native)
- VR support (Three.js)
- Advanced analytics dashboard
- Modding framework

### v1.0
- Cross-platform (Web, Desktop, Mobile)
- Persistent progression
- Competitive ladder rankings
- Professional esports integration

---

**Status**: 🟢 **Playable Alpha - 95% Feature Complete**

*"The best strategy game is one where your opponent makes decisions you didn't anticipate, and the market goes where no algorithm predicted."*
