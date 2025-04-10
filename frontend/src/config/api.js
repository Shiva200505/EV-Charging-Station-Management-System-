export const API_BASE_URL = 'http://localhost:4000/api';

// Auth endpoints
export const AUTH_ENDPOINTS = {
  register: `${API_BASE_URL}/auth/register`,
  login: `${API_BASE_URL}/auth/login`,
  profile: `${API_BASE_URL}/auth/profile`,
};

// Charging stations endpoints
export const STATIONS_ENDPOINTS = {
  list: `${API_BASE_URL}/stations`,
  details: (id) => `${API_BASE_URL}/stations/${id}`,
};

// Vehicle endpoints
export const VEHICLE_ENDPOINTS = {
  types: `${API_BASE_URL}/vehicles/types`,
};

// Booking endpoints
export const BOOKING_ENDPOINTS = {
  create: `${API_BASE_URL}/bookings`,
  userBookings: `${API_BASE_URL}/bookings/user`,
  details: (id) => `${API_BASE_URL}/bookings/${id}`,
  cancel: `${API_BASE_URL}/bookings/cancel`,
};

// Payment endpoints
export const PAYMENT_ENDPOINTS = {
  process: `${API_BASE_URL}/payments`,
  history: `${API_BASE_URL}/payments/user`,
  details: (id) => `${API_BASE_URL}/payments/${id}`,
};

// Feedback endpoints
export const FEEDBACK_ENDPOINTS = {
  submit: `${API_BASE_URL}/feedback`,
  stationFeedback: (id) => `${API_BASE_URL}/feedback/station/${id}`,
  userFeedback: `${API_BASE_URL}/feedback/user`,
}; 