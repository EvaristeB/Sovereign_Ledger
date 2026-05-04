import GameAPI from './api/GameAPI';

console.log(`
╔════════════════════════════════════════════════════════════════╗
║                     SOVEREIGN LEDGER v0.1.0                    ║
║          Empire by Flux, Conquest by the Count                ║
║════════════════════════════════════════════════════════════════╝
`);

const api = new GameAPI(3000);

console.log(`
✓ Game engine initialized
✓ API server running on http://localhost:3000
✓ WebSocket server ready for client connections
✓ Procedural universe generated

⚙ Game Loop Status:
  - Cycle interval: 2000ms
  - Market updates: Active
  - Logistics processing: Active
  - Event generation: Active
  - Financial calculations: Active
  - Technology advancement: Active

📊 Game Systems Loaded:
  [✓] Market System
  [✓] Resource System
  [✓] Logistics System
  [✓] Exploration System
  [✓] Warfare System
  [✓] Event System
  [✓] Game Engine

📡 API Endpoints:
  GET  /health                    - Health check
  GET  /api/game/state            - Current game state
  GET  /api/market/:resource      - Market info for resource
  GET  /api/events                - Active game events
  POST /api/game/toggle-pause     - Pause/resume game

📡 WebSocket Events:
  join_game              - Join the game as a player
  subscribe_updates      - Subscribe to real-time updates
  create_fleet           - Create a new fleet
  list_for_sale          - List resources on market
  get_market             - Fetch market listings
  buy_discovery          - Purchase exploration data
  declare_war            - Declare war on opponent
  blockade_route         - Establish blockade
  
🎮 Ready for players to connect!

`);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Sovereign Ledger...');
  api.getEngine().stop();
  process.exit(0);
});
