import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AUTH_ENDPOINTS, BOOKING_ENDPOINTS, STATIONS_ENDPOINTS } from "../config/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [stations, setStations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleCancelBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BOOKING_ENDPOINTS.cancel}/${bookingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      // Update bookings list after cancellation
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled' }
          : booking
      ));

    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch user profile
        const userResponse = await fetch(AUTH_ENDPOINTS.profile, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await userResponse.json();
        setUserData(userData);

        // Fetch user's bookings
        const bookingsResponse = await fetch(BOOKING_ENDPOINTS.userBookings, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!bookingsResponse.ok) {
          throw new Error('Failed to fetch bookings');
        }

        const bookingsData = await bookingsResponse.json();
        
        // Fetch stations data for each booking
        const stationsData = {};
        for (const booking of bookingsData) {
          if (!stationsData[booking.station_id]) {
            const stationResponse = await fetch(STATIONS_ENDPOINTS.details(booking.station_id), {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            if (stationResponse.ok) {
              const stationData = await stationResponse.json();
              stationsData[booking.station_id] = stationData;
            }
          }
        }
        
        setStations(stationsData);
        setBookings(bookingsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Sort bookings by date in descending order
  const sortedBookings = [...bookings].sort((a, b) => 
    new Date(b.start_time) - new Date(a.start_time)
  );

  // Get the next upcoming booking
  const nextBooking = sortedBookings.find(booking => 
    new Date(booking.start_time) > new Date() && booking.status !== 'cancelled'
  );

  // Get past bookings
  const pastBookings = sortedBookings.filter(booking => 
    new Date(booking.start_time) < new Date() || booking.status === 'cancelled'
  );

  // Limit past bookings to the latest 6
  const recentPastBookings = pastBookings.slice(0, 6);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>WELCOME, {userData?.name?.toUpperCase()} 👋</h2>
        </div>

        <div className="dashboard-section">
          <h3>Summary of Past Bookings {pastBookings.length > 6 && `(showing latest 6 of ${pastBookings.length})`}</h3>
          {pastBookings.length > 0 ? (
            <ul>
              {recentPastBookings.map((booking) => (
                <li key={booking.id} className="booking-item">
                  <div className="booking-info">
                    <span>
                      {formatDate(booking.start_time)} - {stations[booking.station_id]?.name || 'Loading...'}
                    </span>
                    <div className="booking-actions">
                      <span className={`status ${booking.status.toLowerCase()}`}>
                        {booking.status}
                      </span>
                      {booking.status !== 'cancelled' && new Date(booking.start_time) > new Date() && (
                        <button 
                          onClick={() => handleCancelBooking(booking.id)}
                          className="cancel-button"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No past bookings found.</p>
          )}
        </div>

        <div className="dashboard-section">
          <h3>Next Scheduled Booking</h3>
          {nextBooking ? (
            <div className="next-booking">
              <p>📅 {formatDate(nextBooking.start_time)} at {stations[nextBooking.station_id]?.name || 'Loading...'}</p>
              {nextBooking.status !== 'cancelled' && (
                <button 
                  onClick={() => handleCancelBooking(nextBooking.id)}
                  className="cancel-button"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          ) : (
            <p>No upcoming bookings.</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;
