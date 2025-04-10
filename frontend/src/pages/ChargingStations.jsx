import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { STATIONS_ENDPOINTS } from '../config/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/ChargingStations.css';

const ChargingStations = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch(STATIONS_ENDPOINTS.list, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch charging stations');
        }

        const data = await response.json();
        console.log('Fetched stations:', data);

        const transformedData = data.map(station => ({
          id: station.id,
          name: station.name,
          status: station.status,
          location: station.location || station.address,
          totalSlots: parseInt(station.total_slots),
          availableSlots: parseInt(station.available_slots),
          chargingType: station.charging_type,
          powerOutput: station.power_rating,
          price: parseFloat(station.price_per_kwh)
        }));

        console.log('Transformed stations:', transformedData);
        setStations(transformedData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching stations:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  const filteredStations = stations.filter(station => {
    const searchLower = searchTerm.toLowerCase();
    return (
      station.name.toLowerCase().includes(searchLower) ||
      station.location.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading charging stations...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="error-container">
          <p className="error-message">Error: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="charging-stations-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name or location..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="stations-grid">
          {filteredStations.map((station) => (
            <div key={station.id} className="station-card">
              <h2>{station.name}</h2>
              <div className={`status-badge ${station.status.toLowerCase()}`}>
                {station.status.toLowerCase() === 'maintenance' ? 'maintenance' : 'active'}
              </div>
              <div className="station-info">
                <p>
                  <span className="label">Location:</span>
                  <span className="value">{station.location}</span>
                </p>
                <p>
                  <span className="label">Charging Type:</span>
                  <span className="value">{station.chargingType}</span>
                </p>
                <p>
                  <span className="label">Power Output:</span>
                  <span className="value">{station.powerOutput}</span>
                </p>
                <p>
                  <span className="label">Price:</span>
                  <span className="value">₹{station.price}/kWh</span>
                </p>
                <p>
                  <span className="label">Available Slots:</span>
                  <span className="value">{station.availableSlots} / {station.totalSlots}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ChargingStations; 