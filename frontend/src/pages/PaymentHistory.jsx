import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import { PAYMENT_ENDPOINTS } from '../config/api';
import '../styles/PaymentHistory.css';

const PaymentHistory = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(PAYMENT_ENDPOINTS.history, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setPayments(response.data);
      } catch (error) {
        console.error('Error fetching payments:', error);
        setError('Failed to load payment history');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [navigate]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#4CAF50';
      case 'pending':
        return '#FFA500';
      case 'failed':
        return '#FF0000';
      default:
        return '#000000';
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="payment-history-container">
          <div className="loading-spinner">Loading payment history...</div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="payment-history-container">
        <h2>
          <span className="diamond">◆</span>
          Payment History
        </h2>

        {error && <div className="error-message">{error}</div>}

        {payments.length === 0 ? (
          <div className="no-payments">
            <p>No payment history found.</p>
            <button onClick={() => navigate('/charging-stations')} className="book-now-button">
              Book a Charging Slot
            </button>
          </div>
        ) : (
          <div className="payments-list">
            {payments.map((payment) => (
              <div key={payment.id} className="payment-card">
                <div className="payment-header">
                  <h3>Payment #{payment.id}</h3>
                  <span 
                    className="payment-status"
                    style={{ backgroundColor: getStatusColor(payment.status) }}
                  >
                    {payment.status}
                  </span>
                </div>
                <div className="payment-details">
                  <div className="detail-row">
                    <span className="label">Station:</span>
                    <span className="value">{payment.station_name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Amount:</span>
                    <span className="value">₹{payment.amount}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Date:</span>
                    <span className="value">
                      {new Date(payment.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Method:</span>
                    <span className="value">{payment.payment_method}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default PaymentHistory; 