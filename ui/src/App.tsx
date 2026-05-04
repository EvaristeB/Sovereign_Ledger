import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import Dashboard from './components/Dashboard';
import MarketOverview from './components/MarketOverview';
import FleetManager from './components/FleetManager';
import DiplomacyPanel from './components/DiplomacyPanel';
import EventsFeed from './components/EventsFeed';
import './styles/App.css';

interface GameState {
  cycle: number;
  empireId: string;
  empire: any;
  isConnected: boolean;
  gameState: any;
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    cycle: 0,
    empireId: '',
    empire: null,
    isConnected: false,
    gameState: null,
  });

  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'market' | 'fleet' | 'diplomacy' | 'events'>('overview');

  useEffect(() => {
    const newSocket = io('http://localhost:3000');

    newSocket.on('connect', () => {
      console.log('Connected to Sovereign Ledger server');
      setGameState(prev => ({ ...prev, isConnected: true }));

      // Join game with new empire
      newSocket.emit('join_game', {
        playerId: `player_${Math.random().toString(36).substr(2, 9)}`,
        empireData: {
          name: `Empire_${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
          startingCredits: 100000,
        },
      }, (response: any) => {
        setGameState(prev => ({
          ...prev,
          empireId: response.empire.id,
          empire: response.empire,
        }));
      });

      // Subscribe to game updates
      newSocket.emit('subscribe_updates');
    });

    newSocket.on('game_update', (data) => {
      setGameState(prev => ({ ...prev, cycle: data.cycle, gameState: data }));
    });

    newSocket.on('disconnect', () => {
      setGameState(prev => ({ ...prev, isConnected: false }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-title">
          <h1>⚡ SOVEREIGN LEDGER</h1>
          <span className="game-status">Economy IS the Gameplay</span>
        </div>
        <div className="empire-info">
          <div className="empire-item">
            <strong>{gameState.empireId || 'Initializing...'}</strong>
          </div>
          <div className="empire-item">
            Cycle: <strong>#{gameState.cycle}</strong>
          </div>
          <div className="empire-item">
            {gameState.isConnected ? '🟢 Connected' : '🔴 Offline'}
          </div>
        </div>
      </header>

      <nav className="app-nav">
        <button
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`nav-tab ${activeTab === 'market' ? 'active' : ''}`}
          onClick={() => setActiveTab('market')}
        >
          💰 Market
        </button>
        <button
          className={`nav-tab ${activeTab === 'fleet' ? 'active' : ''}`}
          onClick={() => setActiveTab('fleet')}
        >
          ⚓ Fleet Management
        </button>
        <button
          className={`nav-tab ${activeTab === 'diplomacy' ? 'active' : ''}`}
          onClick={() => setActiveTab('diplomacy')}
        >
          🤝 Diplomacy
        </button>
        <button
          className={`nav-tab ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          📡 Events
        </button>
      </nav>

      <div className="app-content">
        {activeTab === 'overview' && (
          <div className="content-panel active">
            <Dashboard socket={socket} />
          </div>
        )}
        {activeTab === 'market' && (
          <div className="content-panel active">
            <MarketOverview socket={socket} />
          </div>
        )}
        {activeTab === 'fleet' && (
          <div className="content-panel active">
            <FleetManager socket={socket} />
          </div>
        )}
        {activeTab === 'diplomacy' && (
          <div className="content-panel active">
            <DiplomacyPanel socket={socket} />
          </div>
        )}
        {activeTab === 'events' && (
          <div className="content-panel active">
            <EventsFeed socket={socket} />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
