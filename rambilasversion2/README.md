# TranspoTruck - Logistics Management System

A comprehensive logistics management system built with React, TypeScript, Node.js, and MongoDB. This application helps manage truck hiring, invoices, payments, and customer data for logistics companies.

## 🚀 Live Demo

- **Frontend**: [https://ttruck.netlify.app](https://ttruck.netlify.app)
- **Backend API**: [https://rambilas.onrender.com](https://rambilas.onrender.com)

## ✨ Features

- **Customer Management**: Add, edit, and manage customer information
- **Invoice Generation**: Create and manage invoices with GST calculations
- **Lorry Receipt Management**: Track and manage lorry receipts
- **Truck Hiring Notes**: Manage truck hiring documentation
- **Payment Tracking**: Track payments and pending amounts
- **Ledger Management**: Comprehensive financial ledger system
- **Export Functionality**: Export data to Excel, PDF formats
- **GST Compliance**: Built-in GST calculations and reporting
- **Responsive Design**: Mobile-friendly interface

## 🛠️ Tech Stack

### Frontend
- React 19.1.1
- TypeScript
- Vite
- React Router DOM
- Axios for API calls
- jsPDF for PDF generation
- HTML2Canvas for PDF rendering
- XLSX for Excel export

### Backend
- Node.js
- Express.js
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- CORS enabled
- Sharp for image processing

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rambilas
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Environment Setup**
   ```bash
   # Copy environment example file
   cp env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Start development servers**
   ```bash
   # Start both frontend and backend
   npm run start-all
   
   # Or start individually
   npm run start-frontend  # Frontend on http://localhost:5173
   npm run start-backend   # Backend on http://localhost:8080
   ```

## 🔧 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=https://rambilas.onrender.com/api
VITE_GSTIN_API_KEY=your_gstin_api_key_here
```

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/...
PORT=8080
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your-super-secure-jwt-secret-key
APP_PASSWORD_HASH=your-app-password-hash
```

## 🚀 Deployment

### Netlify (Frontend)

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard:
   - `VITE_API_URL`: `https://rambilas.onrender.com/api`
   - `VITE_GSTIN_API_KEY`: Your GSTIN API key

### Render (Backend)

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `cd backend && npm install && npm run build`
4. Set start command: `cd backend && npm start`
5. Add environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `CORS_ORIGIN`: `https://ttruck.netlify.app`
   - `JWT_SECRET`: Generate a secure secret
   - `APP_PASSWORD_HASH`: Generate a secure hash
   - `NODE_ENV`: `production`

## 📁 Project Structure

```
rambilas/
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   └── export/          # Export-related components
├── services/            # API service functions
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
├── constants/           # Application constants
├── backend/             # Backend API
│   ├── src/
│   │   ├── controllers/ # Route controllers
│   │   ├── models/      # Database models
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Express middleware
│   │   └── utils/       # Utility functions
│   └── dist/            # Compiled JavaScript
├── dist/                # Frontend build output
└── public/              # Static assets
```

## 🔐 Security Features

- JWT-based authentication
- CORS protection
- Input validation with Zod
- Password hashing
- Environment variable protection
- Rate limiting (can be added)

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Invoices
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Create payment
- `PUT /api/payments/:id` - Update payment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@transpotruck.com or create an issue in the GitHub repository.

## 🔄 Version History

- **v1.0.0** - Initial release with core features
  - Customer management
  - Invoice generation
  - Payment tracking
  - Export functionality
  - GST compliance
