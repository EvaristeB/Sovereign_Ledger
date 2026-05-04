import express, { Request, Response } from 'express';
import { Server as IOServer } from 'socket.io';
import GameEngine from '../services/GameEngine';
import { ResourceType, Fleet, Vessel } from '../types';

export class GameAPI {
  private app: express.Application;
  private io: IOServer;
  private engine: GameEngine;
  private connectedPlayers: Map<string, string> = new Map(); // socketId -> playerId

  constructor(port: number = 3000) {
    this.app = express();
    this.engine = new GameEngine();

    this.app.use(express.json());

    // Start HTTP server with Socket.IO
    const server = this.app.listen(port, () => {
      console.log(`[API] Server running on port ${port}`);
    });

    this.io = new IOServer(server, {
      cors: { origin: '*' },
    });

    this.setupRoutes();
    this.setupSockets();
    this.engine.start(2000); // 2 second game cycles
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({ status: 'ok', version: '0.1.0' });
    });

    // Game state
    this.app.get('/api/game/state', (req: Request, res: Response) => {
      res.json(this.engine.getGameState());
    });

    // Market information
    this.app.get('/api/market/:resource', (req: Request, res: Response) => {
      const resource = req.params.resource as ResourceType;
      res.json(this.engine.getMarketInfo(resource));
    });

    // Active events
    this.app.get('/api/events', (req: Request, res: Response) => {
      res.json(this.engine.getActiveEvents());
    });

    // Pause/Resume
    this.app.post('/api/game/toggle-pause', (req: Request, res: Response) => {
      const paused = this.engine.togglePause();
      res.json({ paused });
    });
  }

  private setupSockets(): void {
    this.io.on('connection', (socket) => {
      console.log(`[Socket] New connection: ${socket.id}`);

      // Join game
      socket.on('join_game', (data: { playerId: string; empireData: any }, callback) => {
        this.connectedPlayers.set(socket.id, data.playerId);
        console.log(`[Socket] Player ${data.playerId} joined`);

        // Create/retrieve empire
        const empire = this.engine.createEmpire(
          data.playerId,
          data.empireData?.name || `Empire_${data.playerId.slice(0, 8)}`,
          data.empireData?.startingCredits || 100000
        );

        socket.emit('game_joined', { empireId: empire.id, empire });
      });

      // Subscribe to game updates
      socket.on('subscribe_updates', () => {
        console.log(`[Socket] Player subscribed to updates`);

        // Send initial state
        socket.emit('game_state', this.engine.getGameState());

        // Subscribe to broadcasts
        socket.join('game_updates');
      });

      // Create fleet
      socket.on('create_fleet', (data: { empireId: string; ships: any[] }, callback) => {
        console.log(`[Socket] Fleet creation requested for empire ${data.empireId}`);

        const fleet: Fleet = {
          id: `fleet_${Date.now()}`,
          empireId: data.empireId,
          ships: data.ships.map((s, i) => ({
            id: `ship_${Date.now()}_${i}`,
            type: s.type,
            fleetId: '',
            health: 100,
            maxHealth: 100,
            cargo: s.cargo || 100,
          })) as Vessel[],
          currentLocation: { x: 0, y: 0, z: 0 },
          cargo: [],
        };

        fleet.ships.forEach(s => s.fleetId = fleet.id);

        if (callback) {
          callback({ success: true, fleet, message: 'Fleet created successfully' });
        }

        this.io.to('game_updates').emit('fleet_created', { fleet });
      });

      // Place market listing
      socket.on('list_for_sale', (data: { empireId: string; resource: ResourceType; quantity: number; price: number }, callback) => {
        console.log(
          `[Socket] Empire ${data.empireId} listing ${data.quantity} of ${data.resource}`
        );

        const listing = {
          id: `listing_${Date.now()}`,
          resource: data.resource,
          quantity: data.quantity,
          price: data.price,
          seller: data.empireId,
        };

        if (callback) {
          callback({ success: true, listing });
        }

        this.io.to('game_updates').emit('market_listing', { listing });
      });

      // Get market listings
      socket.on('get_market', (data: { resource: ResourceType }, callback) => {
        // In a real implementation, this would query the actual market
        const listings: any[] = [];
        if (callback) {
          callback({ listings });
        }
      });

      // Request discovery info
      socket.on('buy_discovery', (data: { buyerId: string; discoveryId: string; price: number }, callback) => {
        console.log(`[Socket] Discovery purchase: ${data.discoveryId}`);

        if (callback) {
          callback({ success: true, discovered: true });
        }

        this.io.to('game_updates').emit('discovery_purchased', {
          buyerId: data.buyerId,
          discoveryId: data.discoveryId,
        });
      });

      // Declare war
      socket.on('declare_war', (data: { aggressorId: string; defenderId: string; cause: string }, callback) => {
        console.log(`[Socket] War declared: ${data.aggressorId} vs ${data.defenderId}`);

        const warData = {
          id: `war_${Date.now()}`,
          aggressor: data.aggressorId,
          defender: data.defenderId,
          cause: data.cause,
        };

        if (callback) {
          callback({ success: true, war: warData });
        }

        this.io.to('game_updates').emit('war_declared', warData);
      });

      // Establish blockade
      socket.on('blockade_route', (data: { attackerId: string; targetLocation: any; strength: number }, callback) => {
        console.log(`[Socket] Blockade placed at`, data.targetLocation);

        const blockade = {
          id: `blockade_${Date.now()}`,
          location: data.targetLocation,
          strength: data.strength,
        };

        if (callback) {
          callback({ success: true, blockade });
        }

        this.io.to('game_updates').emit('blockade_established', blockade);
      });

      // Disconnect
      socket.on('disconnect', () => {
        const playerId = this.connectedPlayers.get(socket.id);
        this.connectedPlayers.delete(socket.id);
        console.log(`[Socket] Disconnected: ${socket.id} (player: ${playerId})`);
      });

      // Broadcast game state periodically
      const updateInterval = setInterval(() => {
        socket.emit('state_update', {
          cycle: (this.engine.getGameState().cycle || 0),
          timestamp: Date.now(),
        });
      }, 5000); // Every 5 seconds

      socket.on('disconnect', () => {
        clearInterval(updateInterval);
      });
    });

    // Broadcast game updates to all connected clients periodically
    setInterval(() => {
      this.io.to('game_updates').emit('game_update', {
        cycle: (this.engine.getGameState().cycle || 0),
        events: this.engine.getActiveEvents(),
        timestamp: Date.now(),
      });
    }, 3000);
  }

  public getEngine(): GameEngine {
    return this.engine;
  }
}

export default GameAPI;
