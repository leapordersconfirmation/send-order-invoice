# Order Invoice Email API

A serverless API for sending order invoice emails, optimized for Vercel deployment.

## Setup

1. Create a `.env` file with your Gmail credentials:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
```

Note: For Gmail, you need to use an App Password. To get one:
1. Enable 2-Step Verification in your Google Account
2. Go to Security → App Passwords
3. Generate a new app password for "Mail"

## Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy to Vercel:
```bash
vercel
```

## Usage

Send a POST request to your deployed API endpoint:

```javascript
const response = await fetch('https://your-vercel-deployment-url/api/send-order-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    orderData: {
      orderId: 'ORDER-123',
      customer: {
        fullName: 'John Doe',
        email: 'customer@example.com',
        address: '123 Main St',
        city: 'New York',
        town: 'NY'
      },
      items: [
        {
          name: 'Product 1',
          quantity: 2,
          price: 29.99
        }
      ],
      summary: {
        subtotal: 59.98,
        shipping: 5.99,
        tax: 6.00,
        total: 71.97
      }
    }
  })
});

const result = await response.json();
```

## Response Format

Success Response (200):
```json
{
  "message": "Invoice email sent successfully"
}
```

Error Response (400/500):
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

## Environment Variables

- `EMAIL_USER`: Your Gmail address
- `EMAIL_PASSWORD`: Your Gmail app-specific password 