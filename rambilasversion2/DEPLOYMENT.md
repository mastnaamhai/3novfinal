# Deployment Guide

This guide will help you deploy the TranspoTruck application to GitHub, Render (backend), and Netlify (frontend).

## 🚀 Quick Deployment Steps

### 1. GitHub Setup

1. **Create a new repository on GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/rambilas.git
   git push -u origin main
   ```

2. **Ensure all sensitive files are in .gitignore**
   - `.env` files
   - `node_modules/`
   - `dist/` folders
   - Database credentials

### 2. Render Backend Deployment

1. **Go to [Render Dashboard](https://dashboard.render.com)**
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name**: `rambilas-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Node Version**: `18`

5. **Add Environment Variables:**
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://bharatamazon70_db_user:admin123@cluster0.qb8hpbj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   CORS_ORIGIN=https://ttruck.netlify.app
   JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production-min-32-chars
   APP_PASSWORD_HASH=240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
   VITE_GSTIN_API_KEY=6aa257a9cb3cc85897248e981fb99cfb
   ```

6. **Deploy the service**

### 3. Netlify Frontend Deployment

1. **Go to [Netlify Dashboard](https://app.netlify.com)**
2. **Click "New site from Git"**
3. **Connect your GitHub repository**
4. **Configure the build:**
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Node Version**: `18`

5. **Add Environment Variables:**
   ```
   VITE_API_URL=https://rambilas.onrender.com/api
   VITE_GSTIN_API_KEY=6aa257a9cb3cc85897248e981fb99cfb
   ```

6. **Deploy the site**

## 🔧 Environment Variables Reference

### Backend (Render)
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `CORS_ORIGIN` | Allowed frontend origin | `https://ttruck.netlify.app` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `APP_PASSWORD_HASH` | App password hash | `hashed-password` |
| `VITE_GSTIN_API_KEY` | GSTIN API key | `your-api-key` |

### Frontend (Netlify)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://rambilas.onrender.com/api` |
| `VITE_GSTIN_API_KEY` | GSTIN API key | `your-api-key` |

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `CORS_ORIGIN` matches your frontend URL exactly
   - Check that both URLs use HTTPS in production

2. **Build Failures**
   - Verify Node.js version (18+)
   - Check that all dependencies are installed
   - Ensure TypeScript compilation succeeds

3. **Database Connection Issues**
   - Verify MongoDB URI is correct
   - Check network access in MongoDB Atlas
   - Ensure database user has proper permissions

4. **Environment Variables Not Loading**
   - Check variable names match exactly
   - Ensure no extra spaces or quotes
   - Restart the service after adding variables

### Health Checks

- **Backend Health**: `https://rambilas.onrender.com/health`
- **API Status**: `https://rambilas.onrender.com/`

## 📊 Monitoring

### Render Monitoring
- Check service logs in Render dashboard
- Monitor resource usage
- Set up alerts for downtime

### Netlify Monitoring
- Check build logs in Netlify dashboard
- Monitor site performance
- Set up form notifications if using forms

## 🔄 Updates and Maintenance

### Updating the Application
1. Make changes to your code
2. Commit and push to GitHub
3. Render and Netlify will automatically redeploy

### Database Backups
- Set up regular MongoDB Atlas backups
- Export data periodically for additional safety

### Security Updates
- Keep dependencies updated
- Monitor for security vulnerabilities
- Rotate JWT secrets periodically

## 📞 Support

If you encounter issues during deployment:
1. Check the service logs
2. Verify environment variables
3. Test locally first
4. Contact support if needed
