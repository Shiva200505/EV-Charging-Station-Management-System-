const nodemailer = require('nodemailer');
require('dotenv').config();

// Create reusable transporter with more robust settings
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Function to verify transporter configuration
const verifyTransporter = async () => {
  try {
    await transporter.verify();
    console.log('SMTP connection verified successfully');
  } catch (error) {
    console.error('SMTP connection verification failed:', error);
    throw error;
  }
};

// Function to send email with retry logic
const sendEmailWithRetry = async (mailOptions, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} to send email to:`, mailOptions.to);
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.response);
      return info;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) {
        throw error;
      }
      // Wait for 2 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

// Function to format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Function to send payment confirmation email
const sendPaymentConfirmationEmail = async ({ userEmail, userName, bookingDetails }) => {
  try {
    await verifyTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Payment Confirmation - EV Charging Station',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Payment Confirmation</h2>
          <p>Dear ${userName},</p>
          <p>Thank you for your payment. Your booking has been confirmed.</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2c3e50;">Booking Details:</h3>
            <p><strong>Booking ID:</strong> ${bookingDetails.id}</p>
            <p><strong>Station:</strong> ${bookingDetails.stationName}</p>
            <p><strong>Location:</strong> ${bookingDetails.location}</p>
            <p><strong>Start Time:</strong> ${new Date(bookingDetails.startTime).toLocaleString()}</p>
            <p><strong>Amount Paid:</strong> ₹${bookingDetails.amount}</p>
          </div>
          <p>If you have any questions, please don't hesitate to contact us.</p>
          <p>Best regards,<br>EV Charging Station Team</p>
        </div>
      `
    };

    await sendEmailWithRetry(mailOptions);
    return true;
  } catch (error) {
    console.error('Failed to send payment confirmation email:', error);
    throw error;
  }
};

// Function to send cancellation email
const sendCancellationEmail = async ({ userEmail, userName, bookingDetails }) => {
  try {
    await verifyTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Booking Cancellation Confirmation - EV Charging Station',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Booking Cancellation Confirmation</h2>
          <p>Dear ${userName},</p>
          <p>Your booking has been cancelled successfully.</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2c3e50;">Cancelled Booking Details:</h3>
            <p><strong>Booking ID:</strong> ${bookingDetails.id}</p>
            <p><strong>Station:</strong> ${bookingDetails.stationName}</p>
            <p><strong>Location:</strong> ${bookingDetails.location}</p>
            <p><strong>Start Time:</strong> ${new Date(bookingDetails.startTime).toLocaleString()}</p>
            <p><strong>Amount:</strong> ₹${bookingDetails.amount}</p>
          </div>
          <p>Your payment will be refunded within 2-3 working days.</p>
          <p>If you have any questions, please don't hesitate to contact us.</p>
          <p>Best regards,<br>EV Charging Station Team</p>
        </div>
      `
    };

    await sendEmailWithRetry(mailOptions);
    return true;
  } catch (error) {
    console.error('Failed to send cancellation email:', error);
    throw error;
  }
};

module.exports = {
  sendPaymentConfirmationEmail,
  sendCancellationEmail
}; 