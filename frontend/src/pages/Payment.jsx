import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import { PAYMENT_ENDPOINTS, BOOKING_ENDPOINTS } from '../config/api';
import '../styles/Payment.css';

const Payment = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [bookingDetails, setBookingDetails] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchBookingDetails = async () => {
      try {
        const response = await axios.get(BOOKING_ENDPOINTS.details(bookingId), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setBookingDetails(response.data);
      } catch (error) {
        console.error('Error fetching booking details:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError(error.response?.data?.message || 'Failed to load booking details');
        }
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingDetails();
    } else {
      navigate('/charging-stations');
    }
  }, [bookingId, navigate]);

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
    setError('');
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (!paymentMethod) {
      setError('Please select a payment method');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(PAYMENT_ENDPOINTS.process, {
        booking_id: bookingId,
        amount: bookingDetails.total_amount,
        payment_method: paymentMethod
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data && response.data.payment_id) {
        setSuccess('Payment successful!');
        // Update booking status and navigate to feedback page
        setTimeout(() => {
          navigate(`/feedback/${bookingId}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Payment error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(error.response?.data?.message || 'Payment failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="payment-container">
          <div className="loading-spinner">Loading...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="payment-container">
          <div className="error-message">{error}</div>
          <button onClick={() => navigate('/charging-stations')} className="pay-button">
            Return to Charging Stations
          </button>
        </div>
        <Footer />
      </>
    );
  }

  if (!bookingDetails) {
    return (
      <>
        <Navbar />
        <div className="payment-container">
          <div className="error-message">Booking details not found</div>
          <button onClick={() => navigate('/charging-stations')} className="pay-button">
            Return to Charging Stations
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="payment-container">
        <h2>🔹 Payment Details</h2>
        
        {success && <div className="success-message">{success}</div>}
        
        <div className="booking-summary">
          <h3>Booking Summary</h3>
          <div className="summary-details">
            <p><strong>Station:</strong> {bookingDetails.station_name}</p>
            <p><strong>Vehicle Type:</strong> {bookingDetails.vehicle_type}</p>
            <p><strong>Start Time:</strong> {new Date(bookingDetails.start_time).toLocaleString()}</p>
            <p><strong>End Time:</strong> {new Date(bookingDetails.end_time).toLocaleString()}</p>
            <p><strong>Total Amount:</strong> ₹{bookingDetails.total_amount}</p>
          </div>
        </div>

        <form onSubmit={handlePayment} className="payment-form">
          <div className="payment-methods">
            <h3>Select Payment Method</h3>
            
            <div className="payment-option">
              <input
                type="radio"
                id="credit-card"
                name="payment-method"
                value="Credit Card"
                checked={paymentMethod === 'Credit Card'}
                onChange={handlePaymentMethodChange}
              />
              <label htmlFor="credit-card">Credit Card</label>
            </div>

            <div className="payment-option">
              <input
                type="radio"
                id="debit-card"
                name="payment-method"
                value="Debit Card"
                checked={paymentMethod === 'Debit Card'}
                onChange={handlePaymentMethodChange}
              />
              <label htmlFor="debit-card">Debit Card</label>
            </div>

            <div className="payment-option">
              <input
                type="radio"
                id="upi"
                name="payment-method"
                value="UPI"
                checked={paymentMethod === 'UPI'}
                onChange={handlePaymentMethodChange}
              />
              <label htmlFor="upi">UPI</label>
            </div>

            <div className="payment-option">
              <input
                type="radio"
                id="net-banking"
                name="payment-method"
                value="Net Banking"
                checked={paymentMethod === 'Net Banking'}
                onChange={handlePaymentMethodChange}
              />
              <label htmlFor="net-banking">Net Banking</label>
            </div>
          </div>

          <button 
            type="submit" 
            className="pay-button"
            disabled={loading || !paymentMethod}
          >
            {loading ? 'Processing...' : `Pay ₹${bookingDetails.total_amount}`}
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default Payment; 