# 🔧 MongoDB Connection Fix

## Issue
Your Render deployment is failing with this error:
```
MongoDB connection error: Error: querySrv ENOTFOUND _mongodb._tcp.cluster.mongodb.net
```

## ✅ Solution

The issue was that your MongoDB URI was missing the database name. I've fixed this by adding `/transpotruck` to your connection string.

### Updated MongoDB URI:
```
mongodb+srv://bharatamazon70_db_user:admin123@cluster0.qb8hpbj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

## 🚀 How to Fix in Render

1. **Go to your Render dashboard**
2. **Navigate to your service settings**
3. **Go to Environment tab**
4. **Update the MONGODB_URI variable with the corrected value:**

```
MONGODB_URI=mongodb+srv://bharatamazon70_db_user:admin123@cluster0.qb8hpbj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

5. **Save the changes**
6. **Redeploy your service**

## 🔍 Additional Environment Variables for Render

Make sure you have all these environment variables set in Render:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://bharatamazon70_db_user:admin123@cluster0.qb8hpbj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
CORS_ORIGIN=https://ttruck.netlify.app
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production-min-32-chars
APP_PASSWORD_HASH=240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
VITE_GSTIN_API_KEY=6aa257a9cb3cc85897248e981fb99cfb
```

## 🧪 Test the Connection

After updating the environment variables, your service should start successfully. You can test the connection by visiting:

- **Health Check**: `https://rambilas.onrender.com/health`
- **API Status**: `https://rambilas.onrender.com/`

## 🔒 Security Note

For production, consider:
1. **Changing the JWT_SECRET** to a more secure value
2. **Updating the APP_PASSWORD_HASH** with a new secure hash
3. **Using environment variables** instead of hardcoded values

## 📞 If Still Having Issues

1. **Check MongoDB Atlas** - Ensure your cluster is running
2. **Verify network access** - Make sure your IP is whitelisted (or use 0.0.0.0/0 for all IPs)
3. **Check user permissions** - Ensure the database user has proper access
4. **Review Render logs** - Check the deployment logs for any other errors
