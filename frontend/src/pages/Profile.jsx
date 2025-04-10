import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Get user data from localStorage
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);

        // Fetch user's bookings
        const response = await axios.get('/api/bookings/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h2>My Profile</h2>
        
        {error && <div className="alert alert-danger">{error}</div>}

        {user && (
          <div className="card mb-4">
            <div className="card-header">
              <h3>User Information</h3>
            </div>
            <div className="card-body">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h3>Booking History</h3>
          </div>
          <div className="card-body">
            {bookings.length === 0 ? (
              <p>No bookings found.</p>
            ) : (
              <div className="list-group">
                {bookings.map((booking) => (
                  <div key={booking.id} className="list-group-item">
                    <h4>Booking #{booking.id}</h4>
                    <p><strong>Station:</strong> {booking.station_name}</p>
                    <p><strong>Date:</strong> {new Date(booking.slot_time).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {new Date(booking.slot_time).toLocaleTimeString()}</p>
                    <p><strong>Duration:</strong> {booking.duration} minutes</p>
                    <p><strong>Amount:</strong> ₹{booking.total_amount}</p>
                    <p><strong>Status:</strong> <span className={`badge bg-${booking.status.toLowerCase() === 'completed' ? 'success' : 'warning'}`}>{booking.status}</span></p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile; 