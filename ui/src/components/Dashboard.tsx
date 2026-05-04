import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/Dashboard.css';

interface DashboardProps {
  socket: Socket | null;
}

const Dashboard: React.FC<DashboardProps> = ({ socket }) => {
  const [empire, setEmpire] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!socket) return;

    // Fetch empire data
    socket.emit('get_empire_status', (response: any) => {
      setEmpire(response.empire);
    });

    // Subscribe to empire updates
    socket.on('empire_updated', (data) => {
      setEmpire(data.empire);
      
      // Add to chart
      setChartData(prev => {
        const newData = [...prev, {
          cycle: data.cycle,
          treasury: data.empire.treasury,
          fleets: data.empire.fleets?.length || 0,
          factories: data.empire.factories?.length || 0,
        }];
        return newData.slice(-50);
      });
    });

    return () => {
      socket.off('empire_updated');
    };
  }, [socket]);

  if (!empire) {
    return <div className="dashboard"><p>Loading empire data...</p></div>;
  }

  const stats = {
    treasury: empire.treasury || 0,
    resources: empire.resources || [],
    fleets: empire.fleets?.length || 0,
    colonies: empire.colonies?.length || 0,
    factories: empire.factories?.length || 0,
    tech: empire.technology || {},
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>📊 Empire Overview</h2>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Treasury</span>
            <span className="stat-card-icon">💰</span>
          </div>
          <div className="stat-card-value">{(stats.treasury / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })}K</div>
          <div className="stat-card-subtitle">Credits</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Fleets</span>
            <span className="stat-card-icon">⚓</span>
          </div>
          <div className="stat-card-value">{stats.fleets}</div>
          <div className="stat-card-subtitle">Active vessels</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Colonies</span>
            <span className="stat-card-icon">🏭</span>
          </div>
          <div className="stat-card-value">{stats.colonies}</div>
          <div className="stat-card-subtitle">Production centers</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Resources</span>
            <span className="stat-card-icon">📦</span>
          </div>
          <div className="stat-card-value">{stats.resources.length}</div>
          <div className="stat-card-subtitle">Types in stockpile</div>
        </div>
      </div>

      <div className="chart-container">
        <h3 className="chart-title">💹 Treasury Evolution</h3>
        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 65, 0.1)" />
              <XAxis dataKey="cycle" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{ background: 'rgba(0, 0, 0, 0.8)', border: '1px solid #00ff41' }}
                cursor={{ stroke: '#00ff41' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="treasury"
                stroke="#00ff41"
                dot={false}
                strokeWidth={2}
                name="Treasury (credits)"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-placeholder">Waiting for data...</div>
        )}
      </div>

      <div className="resources-section">
        <h3 className="resources-title">📦 Resource Inventory</h3>
        <div className="resources-grid">
          {stats.resources.length > 0 ? (
            stats.resources.map((res: any, idx: number) => (
              <div key={idx} className="resource-item">
                <span className="resource-name">{res.type}</span>
                <span className="resource-amount">{res.quantity.toLocaleString()} t</span>
                <span className="resource-capacity">Max: {res.capacity?.toLocaleString() || '∞'}</span>
              </div>
            ))
          ) : (
            <p style={{ color: '#aaa' }}>No resources in stockpile</p>
          )}
        </div>
      </div>

      <div className="techlevels-section">
        <h3 className="techlevels-title">🔬 Technology Levels</h3>
        {Object.keys(stats.tech).length > 0 ? (
          Object.entries(stats.tech).map(([techName, level]) => (
            <div key={techName} className="tech-item">
              <div className="tech-label">
                <span className="tech-name">{techName}</span>
                <span className="tech-level">{(level as number).toFixed(1)}/10</span>
              </div>
              <div className="tech-bar">
                <div
                  className="tech-progress"
                  style={{ width: `${Math.min((level as number) * 10, 100)}%` }}
                ></div>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: '#aaa' }}>No technologies researched yet</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
