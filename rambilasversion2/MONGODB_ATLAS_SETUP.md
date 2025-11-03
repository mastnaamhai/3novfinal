# 🗄️ MongoDB Atlas Setup Guide

## Current Issue
Your Render deployment is failing because of MongoDB connection issues. Here's how to fix it:

## ✅ Step 1: Fix MongoDB URI

Your current URI is correct. Use this URI:
```
mongodb+srv://bharatamazon70_db_user:admin123@cluster0.qb8hpbj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

## ✅ Step 2: MongoDB Atlas Network Access

1. **Go to MongoDB Atlas Dashboard**
2. **Navigate to Network Access**
3. **Add IP Address** - Add `0.0.0.0/0` to allow access from anywhere (for Render deployment)
4. **Or add Render's IP ranges** if you want to be more specific

## ✅ Step 3: Database User Permissions

1. **Go to Database Access**
2. **Check your user `bharatamazon70_db_user`**
3. **Ensure it has "Read and write to any database" permissions**
4. **Or create a new user with proper permissions**

## ✅ Step 4: Update Render Environment Variables

In your Render dashboard, update these environment variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://bharatamazon70_db_user:admin123@cluster0.qb8hpbj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
CORS_ORIGIN=https://ttruck.netlify.app
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production-min-32-chars
APP_PASSWORD_HASH=240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
VITE_GSTIN_API_KEY=6aa257a9cb3cc85897248e981fb99cfb
```

## 🔍 Troubleshooting

### If you still get connection errors:

1. **Check MongoDB Atlas Status**
   - Go to MongoDB Atlas dashboard
   - Check if your cluster is running
   - Verify the connection string

2. **Test Connection Locally**
   ```bash
   # Test with MongoDB Compass or mongo shell
   mongodb+srv://bharatamazon70_db_user:admin123@cluster0.qb8hpbj.mongodb.net/transpotruck
   ```

3. **Check Network Access**
   - Ensure `0.0.0.0/0` is in your IP whitelist
   - Or add Render's specific IP ranges

4. **Verify Database User**
   - Check if the user exists
   - Verify password is correct
   - Ensure proper permissions

## 🚀 After Fixing

Once you've updated the environment variables in Render:

1. **Redeploy your service**
2. **Check the logs** for successful connection
3. **Test the health endpoint**: `https://rambilas.onrender.com/health`
4. **Verify API is working**: `https://rambilas.onrender.com/`

## 🔒 Security Recommendations

For production, consider:

1. **Create a dedicated database user** for production
2. **Use stronger passwords**
3. **Restrict network access** to specific IP ranges
4. **Enable MongoDB Atlas monitoring**
5. **Set up database backups**

## 📊 Monitoring

After successful deployment:
- Monitor MongoDB Atlas metrics
- Set up alerts for connection issues
- Monitor Render service health
- Check application logs regularly
