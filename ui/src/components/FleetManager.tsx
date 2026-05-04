import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import '../styles/Fleet.css';

interface Fleet {
  id: string;
  empireId: string;
  location: string;
  ships: number;
  cargo: { resource: string; quantity: number }[];
  fuel: number;
}

interface FleetManagerProps {
  socket: Socket | null;
}

const FleetManager: React.FC<FleetManagerProps> = ({ socket }) => {
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [selectedFleet, setSelectedFleet] = useState<Fleet | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [moveDestination, setMoveDestination] = useState<string>('');

  useEffect(() => {
    if (!socket) return;

    // Fetch fleets
    socket.emit('get_fleets', (response: any) => {
      setFleets(response.fleets);
    });

    // Subscribe to fleet updates
    socket.on('fleet_created', (data: any) => {
      setFleets(prev => [...prev, data.fleet]);
    });

    socket.on('fleet_moved', (data: any) => {
      setFleets(prev => prev.map(f => f.id === data.fleetId ? { ...f, location: data.newLocation } : f));
      if (selectedFleet?.id === data.fleetId) {
        setSelectedFleet(prev => prev ? { ...prev, location: data.newLocation } : null);
      }
    });

    socket.on('cargo_loaded', (data: any) => {
      setFleets(prev => prev.map(f => f.id === data.fleetId ? { ...f, cargo: data.cargo } : f));
      if (selectedFleet?.id === data.fleetId) {
        setSelectedFleet(prev => prev ? { ...prev, cargo: data.cargo } : null);
      }
    });

    return () => {
      socket.off('fleet_created');
      socket.off('fleet_moved');
      socket.off('cargo_loaded');
    };
  }, [socket]);

  const handleCreateFleet = (ships: number) => {
    socket?.emit('create_fleet', {
      empireId: 'current',
      location: 'alpha-sector-1',
      ships,
    });
    setShowCreateDialog(false);
  };

  const handleMoveFleet = (fleetId: string, destination: string) => {
    socket?.emit('move_fleet', {
      fleetId,
      destination,
    });
    setMoveDestination('');
  };

  return (
    <div className="fleet-manager">
      <div className="fleet-header">
        <h2>⚓ Fleet Command</h2>
        <p className="subtitle">Manage military & cargo vessels across the galaxy</p>
        <button className="new-fleet-btn" onClick={() => setShowCreateDialog(true)}>
          🛳️ New Fleet
        </button>
      </div>

      <div className="fleet-content">
        <div className="fleets-list">
          <h3>Active Fleets ({fleets.length})</h3>
          <div className="fleet-items">
            {fleets.map(fleet => (
              <div
                key={fleet.id}
                className={`fleet-item ${selectedFleet?.id === fleet.id ? 'active' : ''}`}
                onClick={() => setSelectedFleet(fleet)}
              >
                <div className="fleet-badge">⚓</div>
                <div className="fleet-info">
                  <span className="fleet-name">{fleet.id}</span>
                  <span className="fleet-loc">📍 {fleet.location}</span>
                  <span className="fleet-ships">🛸 {fleet.ships} ships</span>
                </div>
                <div className="fleet-fuel">
                  <div className="fuel-bar" style={{ width: `${(fleet.fuel / 1000) * 100}%` }}></div>
                  <span>{fleet.fuel.toLocaleString()} L</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedFleet && (
          <div className="fleet-detail">
            <h3>Fleet: {selectedFleet.id}</h3>
            
            <div className="detail-section">
              <h4>📍 Movement</h4>
              <div className="movement-control">
                <input
                  type="text"
                  placeholder="Destination sector (e.g., beta-sector-2)"
                  value={moveDestination}
                  onChange={(e) => setMoveDestination(e.target.value)}
                />
                <button onClick={() => handleMoveFleet(selectedFleet.id, moveDestination)}>
                  🚀 Navigate
                </button>
              </div>
            </div>

            <div className="detail-section">
              <h4>📦 Cargo ({selectedFleet.cargo.length})</h4>
              {selectedFleet.cargo.length > 0 ? (
                <div className="cargo-items">
                  {selectedFleet.cargo.map((item, idx) => (
                    <div key={idx} className="cargo-item">
                      <span>{item.resource}</span>
                      <span>{item.quantity} tonnes</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty">No cargo loaded</p>
              )}
              <div className="cargo-control">
                <select>
                  <option>Select resource...</option>
                  <option>Iron</option>
                  <option>Copper</option>
                  <option>Fuel</option>
                  <option>Circuits</option>
                </select>
                <input type="number" placeholder="Quantity" min="1" />
                <button>📥 Load</button>
              </div>
            </div>

            <div className="detail-section">
              <h4>⚔️ Military Stats</h4>
              <div className="stats-grid">
                <div className="stat">
                  <label>Ships</label>
                  <span>{selectedFleet.ships}</span>
                </div>
                <div className="stat">
                  <label>Firepower</label>
                  <span>{selectedFleet.ships * 10}</span>
                </div>
                <div className="stat">
                  <label>Fuel Consumption</label>
                  <span>5 L/cycle</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCreateDialog && (
        <div className="modal-overlay" onClick={() => setShowCreateDialog(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Fleet</h3>
            <div className="create-form">
              <label>Number of Ships</label>
              <input type="number" min="1" max="100" defaultValue="10" />
              <div className="modal-buttons">
                <button className="cancel" onClick={() => setShowCreateDialog(false)}>Cancel</button>
                <button className="confirm" onClick={() => {
                  const input = document.querySelector('.create-form input') as HTMLInputElement;
                  handleCreateFleet(parseInt(input.value));
                }}>Create Fleet</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetManager;
