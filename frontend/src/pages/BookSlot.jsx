import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import { STATIONS_ENDPOINTS, BOOKING_ENDPOINTS } from "../config/api";

const BookSlot = () => {
  const navigate = useNavigate();
  const { stationId } = useParams();
  const [stations, setStations] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [bookingData, setBookingData] = useState({
    station_id: stationId || "",
    vehicle_type: "",
    slot_time: "",
    duration: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for authentication
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchStations = async () => {
      try {
        setLoading(true);
        setError(""); // Clear any existing errors
        const response = await axios.get(STATIONS_ENDPOINTS.list, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const transformedStations = response.data.map(station => ({
          ...station,
          price_per_kwh: parseFloat(station.price_per_kwh)
        }));
        
        setStations(transformedStations);
        
        // If stationId is provided, pre-select the station
        if (stationId) {
          const station = transformedStations.find(s => s.id === Number(stationId));
          if (station) {
            setSelectedStation(station);
            setBookingData(prev => ({ ...prev, station_id: stationId }));
          } else {
            setError("Selected station not found");
          }
        }
      } catch (error) {
        console.error("Error fetching stations:", error);
        setError("Failed to load charging stations");
      } finally {
        setLoading(false);
      }
    };

    const fetchVehicles = async () => {
      try {
        const dummyVehicles = [
          { id: 1, type: "Electric Car", avgPowerConsumption: 20 }, // kW
          { id: 2, type: "Electric Bike", avgPowerConsumption: 3 }, // kW
          { id: 3, type: "Electric Scooter", avgPowerConsumption: 2 }, // kW
          { id: 4, type: "Electric Bus", avgPowerConsumption: 30 } // kW
        ];
        setVehicles(dummyVehicles);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        setError("Failed to load vehicle types");
      }
    };

    fetchStations();
    fetchVehicles();
  }, [navigate, stationId]);

  const calculateTotalAmount = () => {
    if (!selectedStation || !bookingData.duration || !bookingData.vehicle_type) return 0;
    
    // Get the selected vehicle's power consumption
    const selectedVehicle = vehicles.find(v => v.type === bookingData.vehicle_type);
    if (!selectedVehicle) return 0;

    // Calculate energy consumption in kWh
    const hours = bookingData.duration / 60;
    const energyConsumed = selectedVehicle.avgPowerConsumption * hours;
    
    // Calculate total cost
    const totalCost = energyConsumed * selectedStation.price_per_kwh;
    return totalCost.toFixed(2);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user changes any input
    setError("");
    setSuccess("");
    
    // If changing station, ensure we update selectedStation
    if (name === 'station_id') {
      const station = stations.find(s => s.id === Number(value));
      setSelectedStation(station || null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Check for authentication again before submitting
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Authentication required. Please log in.");
      navigate('/login');
      return;
    }

    if (!bookingData.station_id || !bookingData.vehicle_type || !bookingData.slot_time || !bookingData.duration) {
      setError("Please fill all fields!");
      return;
    }

    if (bookingData.duration <= 0) {
      setError("Duration must be greater than 0 minutes.");
      return;
    }

    try {
      const totalAmount = calculateTotalAmount();
      const response = await axios.post(BOOKING_ENDPOINTS.create, {
        ...bookingData,
        total_amount: totalAmount
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data && response.data.id) {
        setSuccess("Booking created successfully!");
        // Navigate to payment page with booking ID
        navigate(`/payment/${response.data.id}`);
      }
    } catch (error) {
      console.error("Booking error:", error);
      if (error.response?.status === 401) {
        setError("Authentication required. Please log in again.");
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(error.response?.data?.message || "Booking failed, please try again.");
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="booking-container" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '10px', maxWidth: '500px', margin: '2rem auto', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#2F6B5E', textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ color: '#2F6B5E', marginRight: '10px' }}>◆</span>
          BOOK A CHARGING SLOT
        </h2>
        
        {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        {success && <div style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>{success}</div>}
        
        {loading ? (
          <div style={{ textAlign: 'center' }}>Loading charging stations...</div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ color: '#2F6B5E' }}>Charging Station:</label>
              <select 
                name="station_id" 
                value={bookingData.station_id} 
                onChange={handleChange} 
                required
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: '2px solid #90EE90',
                  backgroundColor: '#F0FFF0',
                  width: '100%',
                  fontSize: '16px'
                }}
              >
                <option value="">Select Station</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.id} disabled={station.status !== "active"}>
                    {station.name} - {station.address} ({station.available_slots} slots available)
                    {station.status !== "active" ? " - " + station.status.toUpperCase() : ""}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ color: '#2F6B5E' }}>Vehicle Type:</label>
              <select 
                name="vehicle_type" 
                value={bookingData.vehicle_type} 
                onChange={handleChange} 
                required
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: '2px solid #90EE90',
                  backgroundColor: '#F0FFF0',
                  width: '100%',
                  fontSize: '16px'
                }}
              >
                <option value="">Select Vehicle Type</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.type}>
                    {vehicle.type} ({vehicle.avgPowerConsumption}kW)
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ color: '#2F6B5E' }}>Slot Time:</label>
              <input 
                type="datetime-local" 
                name="slot_time" 
                value={bookingData.slot_time} 
                onChange={handleChange} 
                required 
                min={new Date().toISOString().slice(0, 16)}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: '2px solid #90EE90',
                  backgroundColor: '#F0FFF0',
                  width: '100%',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ color: '#2F6B5E' }}>Duration (minutes):</label>
              <input 
                type="number" 
                name="duration" 
                value={bookingData.duration} 
                onChange={handleChange} 
                required 
                min="1"
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: '2px solid #90EE90',
                  backgroundColor: '#F0FFF0',
                  width: '100%',
                  fontSize: '16px'
                }}
              />
            </div>

            {selectedStation && bookingData.duration && bookingData.vehicle_type && (
              <div style={{ 
                backgroundColor: '#F0FFF0', 
                padding: '15px', 
                borderRadius: '8px', 
                border: '2px solid #90EE90',
                marginTop: '10px'
              }}>
                <h3 style={{ color: '#2F6B5E', textAlign: 'center', marginBottom: '10px' }}>Price Summary</h3>
                <div style={{ textAlign: 'center' }}>
                  <p>Rate: ₹{selectedStation.price_per_kwh}/kWh</p>
                  <p>Vehicle Power: {vehicles.find(v => v.type === bookingData.vehicle_type)?.avgPowerConsumption}kW</p>
                  <p>Duration: {bookingData.duration} minutes</p>
                  <p style={{ fontWeight: 'bold' }}>Total Amount: ₹{calculateTotalAmount()}</p>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              PROCEED TO PAYMENT
            </button>
          </form>
        )}
      </div>
      <Footer />
    </>
  );
};

export default BookSlot;
