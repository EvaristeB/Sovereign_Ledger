import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../styles/Market.css';

interface MarketOverviewProps {
  socket: Socket | null;
}

const MarketOverview: React.FC<MarketOverviewProps> = ({ socket }) => {
  const [selectedResource, setSelectedResource] = useState<string>('iron');
  const [listings, setListings] = useState<any[]>([]);

  useEffect(() => {
    if (!socket) return;

    // Fetch market info
    socket.emit('get_market', { resource: selectedResource }, (response: any) => {
      setListings(response.listings);
    });

    // Subscribe to market updates
    socket.on('market_listing', (data: any) => {
      setListings(prev => [data.listing, ...prev].slice(0, 20));
    });

    return () => {
      socket.off('market_listing');
    };
  }, [socket, selectedResource]);

  const handleListForSale = (resource: string, quantity: number, price: number) => {
    socket?.emit('list_for_sale', {
      empireId: 'current', // Would be set in real app
      resource,
      quantity,
      price,
    });
  };

  return (
    <div className="market-overview">
      <div className="market-header">
        <h2>📊 Galactic Market</h2>
        <p className="subtitle">Real-time commodity trading across all sectors</p>
      </div>

      <div className="market-resources">
        <div className="resource-buttons">
          {['iron', 'copper', 'fuel', 'circuits', 'antimateria'].map(res => (
            <button
              key={res}
              className={`res-btn ${selectedResource === res ? 'active' : ''}`}
              onClick={() => setSelectedResource(res)}
            >
              {res.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="market-content">
        <div className="price-chart">
          <h3>Price History: {selectedResource.toUpperCase()}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cycle" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="price" fill="#00ff41" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="listings-panel">
          <h3>Active Listings</h3>
          <div className="listings-list">
            {listings.map((listing, idx) => (
              <div key={idx} className="listing-item">
                <div className="listing-info">
                  <span className="seller">🏢 {listing.seller}</span>
                  <span className="quantity">{listing.quantity} tonnes</span>
                  <span className="price">@ {listing.price} credits/t</span>
                </div>
                <button className="buy-btn">BUY</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="trade-panel">
        <h2>Place Listing</h2>
        <form className="listing-form" onSubmit={(e) => {
          e.preventDefault();
          const qty = (e.currentTarget.elements.namedItem('quantity') as HTMLInputElement).value;
          const price = (e.currentTarget.elements.namedItem('price') as HTMLInputElement).value;
          handleListForSale(selectedResource, parseInt(qty), parseInt(price));
        }}>
          <input type="number" name="quantity" placeholder="Quantity (tonnes)" min="1" required />
          <input type="number" name="price" placeholder="Price per tonne" min="1" required />
          <button type="submit">📤 List for Sale</button>
        </form>
      </div>
    </div>
  );
};

export default MarketOverview;
