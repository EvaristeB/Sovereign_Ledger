/**
 * Example client for testing Sovereign Ledger game
 * 
 * Usage:
 *   npm install socket.io-client
 *   npx ts-node example-client.ts
 */

import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

console.log('🚀 Connecting to Sovereign Ledger server...\n');

// Connection established
socket.on('connect', () => {
  console.log('✓ Connected to server\n');

  // Join the game
  socket.emit(
    'join_game',
    {
      playerId: 'player_' + Math.random().toString(36).substr(2, 9),
      empireData: {
        name: 'The Solar Collective',
        startingCredits: 100000,
      },
    },
    (response) => {
      console.log('✓ Empire created:', response.empire.name);
      console.log('  Empire ID:', response.empire.id);
      console.log('  Treasury:', response.empire.treasury, 'credits\n');

      // Subscribe to game updates
      socket.emit('subscribe_updates');

      // Create a test fleet
      socket.emit(
        'create_fleet',
        {
          empireId: response.empire.id,
          ships: [
            { type: 'cargo', cargo: 1000 },
            { type: 'cargo', cargo: 1000 },
            { type: 'cruiser', cargo: 100 },
          ],
        },
        (fleetResponse) => {
          console.log('✓ Fleet created:', fleetResponse.fleet.id);
          console.log('  Ships:', fleetResponse.fleet.ships.length);
          console.log('  Total cargo:', fleetResponse.fleet.ships.reduce((a, s) => a + s.cargo, 0), 'tonnes\n');
        }
      );

      // List resources on market
      setTimeout(() => {
        socket.emit(
          'list_for_sale',
          {
            empireId: response.empire.id,
            resource: 'iron',
            quantity: 5000,
            price: 120,
          },
          (listingResponse) => {
            console.log('✓ Market listing created');
            console.log('  ID:', listingResponse.listing.id);
            console.log('  Resource: Iron');
            console.log('  Quantity: 5000 tonnes');
            console.log('  Price: 120 credits/unit\n');
          }
        );
      }, 1000);
    }
  );
});

// Receive game updates
socket.on('game_update', (data) => {
  console.log(`📊 Cycle ${data.cycle} - ${new Date(data.timestamp).toLocaleTimeString()}`);
  if (data.events && data.events.length > 0) {
    data.events.forEach((evt) => {
      console.log(`   📢 Event: ${evt.type}`);
    });
  }
});

// Receive state updates
socket.on('state_update', (data) => {
  console.log(`   ⏱  Cycle ${data.cycle}`);
});

// Fleet creation
socket.on('fleet_created', (data) => {
  console.log('🚢 Fleet created event received');
});

// Market listings
socket.on('market_listing', (data) => {
  console.log('💰 New market listing:', data.listing.resource, '@', data.listing.price);
});

// War declaration
socket.on('war_declared', (data) => {
  console.log('⚔️  WAR DECLARED:', data.aggressor, 'vs', data.defender);
  console.log('   Cause:', data.cause);
});

// Blockade established
socket.on('blockade_established', (data) => {
  console.log('🚫 Blockade established at', data.location);
  console.log('   Strength:', data.strength);
});

// Connection lost
socket.on('disconnect', () => {
  console.log('\n❌ Disconnected from server');
  process.exit(0);
});

// Error handler
socket.on('error', (error) => {
  console.error('Error:', error);
});

// Keep alive
setTimeout(() => {
  console.log('\n📊 Client still connected. Listening for events...');
  console.log('(Server will broadcast updates every 3 seconds)\n');
}, 5000);
