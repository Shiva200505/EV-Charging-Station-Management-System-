import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar"; // Import Navbar
import Footer from "../components/Footer"; // Import Footer
import axios from "axios";
import { FEEDBACK_ENDPOINTS, BOOKING_ENDPOINTS } from "../config/api";
import '../styles/Feedback.css';

const Feedback = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [bookingDetails, setBookingDetails] = useState(null);
  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    comment: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(BOOKING_ENDPOINTS.details(bookingId), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setBookingDetails(response.data);
      } catch (error) {
        console.error('Error fetching booking details:', error);
        setError('Failed to load booking details');
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeedbackData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(FEEDBACK_ENDPOINTS.submit, {
        booking_id: bookingId,
        station_id: bookingDetails.station_id,
        rating: parseInt(feedbackData.rating),
        comment: feedbackData.comment
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        setSuccess('Thank you for your feedback!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      setError(error.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="feedback-container">
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
        <div className="feedback-container">
          <div className="error-message">{error}</div>
          <button onClick={() => navigate('/dashboard')} className="submit-button">
            Return to Dashboard
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="feedback-container">
        <h2>
          <span className="diamond">◆</span>
          Share Your Experience
        </h2>
        
        <div className="booking-details">
          <h3>Booking Details</h3>
          <div className="detail-row">
            <span className="label">Station:</span>
            <span className="value">{bookingDetails?.station_name}</span>
          </div>
          <div className="detail-row">
            <span className="label">Date:</span>
            <span className="value">
              {bookingDetails?.slot_time && new Date(bookingDetails.slot_time).toLocaleString()}
            </span>
          </div>
          <div className="detail-row">
            <span className="label">Amount Paid:</span>
            <span className="value">₹{bookingDetails?.total_amount}</span>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="rating-section">
            <label>Rate your experience:</label>
            <div className="star-rating">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="star-option">
                  <input
                    type="radio"
                    id={`star${star}`}
                    name="rating"
                    value={star}
                    checked={parseInt(feedbackData.rating) === star}
                    onChange={handleChange}
                  />
                  <label htmlFor={`star${star}`}>{'⭐'.repeat(star)}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="comment-section">
            <label htmlFor="comment">Additional Comments:</label>
            <textarea
              id="comment"
              name="comment"
              value={feedbackData.comment}
              onChange={handleChange}
              placeholder="Share your thoughts about the service..."
              rows="4"
            />
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default Feedback;
