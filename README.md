# EV Charging Station Management System

![image](https://github.com/user-attachments/assets/f2026ff0-1e8b-408b-be8b-4b3e4088ebe5)

## Project Overview

The EV Charging Station Management System is a full-stack application designed to manage electric vehicle charging stations. The system allows users to find charging stations, book slots, make payments, and leave feedback.

## Application Screenshots

### Charging Stations Listing
![Screenshot 2025-04-10 103148](https://github.com/user-attachments/assets/4891f0ed-0b4c-4255-9a91-fdf77f1b9296)


### Booking Interface
![Screenshot 2025-04-10 103203](https://github.com/user-attachments/assets/81ea1d5f-4a24-48c5-8c1a-091f3838976b)
*Book charging slots by selecting station, vehicle type, date/time, and duration*

### Payment Processing
![Screenshot 2025-04-10 103259](https://github.com/user-attachments/assets/48774f10-2140-4e3e-b7e4-6c351c41281d)
*Secure payment system with booking summary and payment method selection*


## Features

- 🔐 **User Authentication**: Secure login and registration system
- 🗺️ **Charging Station Locator**: Find available charging stations
- 📅 **Slot Booking**: Book charging slots at preferred times
- 💳 **Payment Processing**: Secure payment for charging services
- 📊 **Dashboard**: User-friendly dashboard with booking history
- 🔎 **Profile Management**: User profile customization
- 📝 **Feedback System**: Leave feedback after using charging services

## Tech Stack

### Frontend
- React.js with Vite
- React Router for navigation
- Tailwind CSS for styling
- Axios for API requests

### Backend
- Node.js with Express
- MySQL database
- JWT for authentication
- bcrypt.js for password hashing

## Project Structure

```
ev-charging-system/
├── frontend/           # React frontend application
│   ├── public/         # Static files
│   │   ├── assets/     # Images and other assets
│   │   ├── components/ # Reusable components
│   │   ├── config/     # Configuration files
│   │   ├── pages/      # Page components
│   │   └── styles/     # CSS files
│
├── backend/            # Node.js backend application
│   ├── src/
│   │   ├── controllers/ # Request handlers
│   │   ├── middleware/  # Custom middleware
│   │   ├── models/      # Database models
│   │   ├── routes/      # API routes
│   │   ├── utils/       # Utility functions
│   │   └── server.js    # Entry point
│   └── .env             # Environment variables
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL database
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/Shiva200505/EV-Charging-Station-Management-System-.git
   cd ev-charging-system
   ```

2. Setup Backend
   ```
   cd backend
   npm install
   ```

   Create a .env file in the backend directory with the following variables:
   ```
   PORT=4000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=ev_charging_db
   JWT_SECRET=your_jwt_secret_key
   ```

3. Setup Frontend
   ```
   cd ../frontend
   npm install
   ```

### Running the Application

1. Start the Backend:
   ```
   cd backend
   npm run dev
   ```

2. Start the Frontend:
   ```
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:5173/
   ```

## Adding Images to README

To add images to this README:

1. Create an `images` folder in the root directory
   ```
   mkdir images
   ```

2. Add your images to this folder

3. Reference the images in the README using markdown:
   ```markdown
   ![Image description](./images/your-image.png)
   ```

4. For images in different locations, use the correct relative path:
   ```markdown
   ![Frontend Screenshot](./frontend/src/assets/screenshot.png)
   ```

## API Documentation

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user

### Charging Stations
- `GET /api/stations` - Get all charging stations
- `GET /api/stations/:id` - Get a specific charging station
- `POST /api/stations` - Add a new charging station (admin)
- `PUT /api/stations/:id` - Update a charging station (admin)

### Bookings
- `GET /api/bookings` - Get all bookings for current user
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings/:id` - Get a specific booking
- `PUT /api/bookings/:id` - Update a booking
- `DELETE /api/bookings/:id` - Cancel a booking

### Payments
- `POST /api/payments` - Process a payment
- `GET /api/payments` - Get all payments for current user

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback/:bookingId` - Get feedback for a booking

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any queries, please reach out to shivam.sawant23@vit.edu 
