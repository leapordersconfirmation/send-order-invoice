const nodemailer = require('nodemailer');
require('dotenv').config();

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Generate HTML email template
const generateInvoiceEmail = (orderData) => {
  const { customer, items, summary } = orderData;
  
  const itemsList = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${formatCurrency(item.price)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${formatCurrency(item.price * item.quantity)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .order-details { margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background-color: #f8f9fa; text-align: left; padding: 10px; }
          .total { font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; font-size: 0.9em; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Invoice</h1>
            <p>Thank you for your purchase!</p>
          </div>
          
          <div class="order-details">
            <h2>Order Details</h2>
            <p><strong>Order ID:</strong> ${orderData.orderId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Customer:</strong> ${customer.fullName}</p>
            <p><strong>Email:</strong> ${customer.email}</p>
            <p><strong>Shipping Address:</strong><br>
            ${customer.address}<br>
            ${customer.city}, ${customer.town}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
          </table>

          <div class="order-summary">
            <p><strong>Subtotal:</strong> ${formatCurrency(summary.subtotal)}</p>
            <p><strong>Shipping:</strong> ${formatCurrency(summary.shipping)}</p>
            <p><strong>Tax:</strong> ${formatCurrency(summary.tax)}</p>
            <p class="total"><strong>Total:</strong> ${formatCurrency(summary.total)}</p>
          </div>

          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
            <p>© ${new Date().getFullYear()} Leap Smart Solutions. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

// Vercel serverless function
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderData } = req.body;

    if (!orderData || !orderData.customer || !orderData.customer.email) {
      return res.status(400).json({ error: 'Invalid order data' });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: orderData.customer.email,
      subject: 'Your Leap Smart Solutions Order Invoice',
      html: generateInvoiceEmail(orderData)
    };

    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ message: 'Invoice email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send invoice email', details: error.message });
  }
}; 