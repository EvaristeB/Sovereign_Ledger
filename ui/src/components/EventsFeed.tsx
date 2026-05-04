import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import '../styles/Events.css';

interface GameEvent {
  id: string;
  cycle: number;
  type: string;
  sector: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affected: string[];
  impact?: string;
  timestamp: number;
}

interface EventsFeedProps {
  socket: Socket | null;
}

const EventsFeed: React.FC<EventsFeedProps> = ({ socket }) => {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<GameEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<GameEvent | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  useEffect(() => {
    if (!socket) return;

    // Fetch event history
    socket.emit('get_events_history', { limit: 50 }, (response: any) => {
      setEvents(response.events);
    });

    // Subscribe to new events
    socket.on('event_triggered', (data) => {
      setEvents(prev => [data.event, ...prev].slice(0, 100));
    });

    return () => {
      socket.off('event_triggered');
    };
  }, [socket]);

  useEffect(() => {
    let filtered = events;

    if (filterType !== 'all') {
      filtered = filtered.filter(e => e.type === filterType);
    }

    if (filterSeverity !== 'all') {
      filtered = filtered.filter(e => e.severity === filterSeverity);
    }

    setFilteredEvents(filtered);
  }, [events, filterType, filterSeverity]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low':
        return '📡';
      case 'medium':
        return '⚠️';
      case 'high':
        return '🔴';
      case 'critical':
        return '💥';
      default:
        return '❓';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return '#00ff41';
      case 'medium':
        return '#ffff00';
      case 'high':
        return '#ff8800';
      case 'critical':
        return '#ff0000';
      default:
        return '#cccccc';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'solarStorm':
        return '☀️';
      case 'asteroidImpact':
        return '☄️';
      case 'sabotage':
        return '💣';
      case 'workerStrike':
        return '✊';
      case 'blackSwan':
        return '🦢';
      case 'resourceDiscovery':
        return '⛏️';
      case 'pirateActivity':
        return '🏴‍☠️';
      case 'recession':
        return '📉';
      case 'monopolyAlert':
        return '🏛️';
      case 'espionageExposure':
        return '🕵️';
      default:
        return '📰';
    }
  };

  const eventTypes = [
    'all',
    'solarStorm',
    'asteroidImpact',
    'sabotage',
    'workerStrike',
    'blackSwan',
    'resourceDiscovery',
    'pirateActivity',
    'recession',
    'monopolyAlert',
    'espionageExposure',
  ];

  const severities = ['all', 'low', 'medium', 'high', 'critical'];

  return (
    <div className="events-feed">
      <div className="events-header">
        <h2>📡 Galactic Events</h2>
        <p className="subtitle">Real-time alerts, disasters, and market shifts across all sectors</p>
      </div>

      <div className="events-filters">
        <div className="filter-group">
          <label>Event Type:</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            {eventTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Severity:</label>
          <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
            {severities.map(sev => (
              <option key={sev} value={sev}>
                {sev === 'all' ? 'All Levels' : sev.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="events-content">
        <div className="events-list">
          <h3>Event Stream ({filteredEvents.length})</h3>
          <div className="scrollable-events">
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => (
                <div
                  key={event.id}
                  className={`event-item severity-${event.severity} ${
                    selectedEvent?.id === event.id ? 'active' : ''
                  }`}
                  onClick={() => setSelectedEvent(event)}
                  style={{
                    borderLeftColor: getSeverityColor(event.severity),
                  }}
                >
                  <div className="event-badge">
                    <span className="severity-icon">{getSeverityIcon(event.severity)}</span>
                    <span className="type-icon">{getEventTypeIcon(event.type)}</span>
                  </div>
                  <div className="event-summary">
                    <h4>{event.title}</h4>
                    <p className="event-location">📍 {event.sector}</p>
                    <p className="event-time">Cycle #{event.cycle}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>✨ No events match current filters</p>
              </div>
            )}
          </div>
        </div>

        {selectedEvent && (
          <div className="event-detail">
            <div className="detail-header">
              <h3>
                {getSeverityIcon(selectedEvent.severity)} {selectedEvent.title}
              </h3>
              <span
                className="detail-severity"
                style={{ backgroundColor: getSeverityColor(selectedEvent.severity) }}
              >
                {selectedEvent.severity.toUpperCase()}
              </span>
            </div>

            <div className="detail-section">
              <h4>📋 Details</h4>
              <p><strong>Type:</strong> {selectedEvent.type}</p>
              <p><strong>Location:</strong> {selectedEvent.sector}</p>
              <p><strong>Cycle:</strong> #{selectedEvent.cycle}</p>
              <p><strong>Timestamp:</strong> {new Date(selectedEvent.timestamp).toLocaleString()}</p>
            </div>

            <div className="detail-section">
              <h4>📝 Description</h4>
              <p>{selectedEvent.description}</p>
            </div>

            {selectedEvent.impact && (
              <div className="detail-section">
                <h4>⚡ Impact</h4>
                <p>{selectedEvent.impact}</p>
              </div>
            )}

            {selectedEvent.affected.length > 0 && (
              <div className="detail-section">
                <h4>🎯 Affected Empires ({selectedEvent.affected.length})</h4>
                <ul>
                  {selectedEvent.affected.map(empire => (
                    <li key={empire}>
                      🏛️ {empire}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="detail-actions">
              <button className="action-btn acknowledge">✅ Acknowledge</button>
              <button className="action-btn respond">📢 Respond</button>
              <button className="action-btn log">📋 Archive</button>
            </div>
          </div>
        )}
      </div>

      <div className="statistics-panel">
        <h3>📊 Event Statistics</h3>
        <div className="stats-grid">
          <div className="stat-box">
            <span className="stat-label">Total Events</span>
            <span className="stat-value">{events.length}</span>
          </div>
          <div className="stat-box critical">
            <span className="stat-label">Critical 💥</span>
            <span className="stat-value">{events.filter(e => e.severity === 'critical').length}</span>
          </div>
          <div className="stat-box high">
            <span className="stat-label">High 🔴</span>
            <span className="stat-value">{events.filter(e => e.severity === 'high').length}</span>
          </div>
          <div className="stat-box medium">
            <span className="stat-label">Medium ⚠️</span>
            <span className="stat-value">{events.filter(e => e.severity === 'medium').length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsFeed;
