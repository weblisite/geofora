# 🚀 GeoFora - Render Deployment Guide

## **📋 Pre-Deployment Checklist**

- [ ] GitHub repository created and code pushed
- [ ] Neon PostgreSQL database created
- [ ] Clerk account set up with API keys
- [ ] OpenAI API key obtained
- [ ] Render account created

---

## **🛠️ Step 1: Prepare GitHub Repository**

### **1.1 Push Code to GitHub**

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit - GeoFora platform ready for deployment"

# Add GitHub remote (replace with your repo URL)
git remote add origin https://github.com/weblisite/geofora.git

# Push to GitHub
git push -u origin main
```

### **1.2 Repository Requirements**

Ensure your repository includes:
- [ ] `render.yaml` - Render configuration
- [ ] `package.json` - with production scripts
- [ ] `env.template` - Environment variables template
- [ ] All source code
- [ ] This `DEPLOYMENT.md` file

---

## **🗄️ Step 2: Database Setup (Neon)**

### **2.1 Create Neon Database**

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project: **"GeoFora"**
3. Choose region: **Oregon** (matches Render region)
4. Copy the connection string

### **2.2 Database Configuration**

Your Neon connection string should look like:
```
postgresql://username:password@ep-xyz.us-west-2.aws.neon.tech/neondb?sslmode=require
```

---

## **🔐 Step 3: Authentication Setup (Clerk)**

### **3.1 Configure Clerk Application**

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create/select your application
3. In **Settings > API Keys**, copy:
   - `CLERK_SECRET_KEY` (starts with `sk_`)
   - `CLERK_PUBLISHABLE_KEY` (starts with `pk_`)

### **3.2 Set Production Domain**

1. In Clerk Dashboard → **Domains**
2. Add your Render domain: `yourapppname.onrender.com`
3. Update allowed origins and redirect URLs

---

## **🤖 Step 4: OpenAI API Setup**

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `sk-`)

---

## **☁️ Step 5: Deploy to Render**

### **5.1 Automatic Deployment (Recommended)**

1. **Connect GitHub Repository**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click **"New +"** → **"Blueprint"**
   - Connect your GitHub account
   - Select your GeoFora repository
   - Render will automatically detect `render.yaml`

2. **Review Configuration**
   - Service name: `geofora`
   - Environment: `Node`
   - Build command: `npm install && npm run build`
   - Start command: `npm start`

3. **Set Environment Variables**
   - Render will prompt you to set the required variables
   - Use the values from your setup above

### **5.2 Manual Service Creation**

If automatic deployment doesn't work:

1. **Create Web Service**
   - New → Web Service
   - Connect GitHub repository
   - Name: `geofora`
   - Environment: `Node`
   - Region: `Oregon`
   - Branch: `main`
   - Build command: `npm install && npm run build`
   - Start command: `npm start`

2. **Create PostgreSQL Database**
   - New → PostgreSQL
   - Name: `geofora-db`
   - Database: `geofora`
   - User: `geofora`
   - Region: `Oregon`
   - Plan: `Free` (for testing) or `Starter` (for production)

---

## **⚙️ Step 6: Environment Variables**

Set these in Render Dashboard → Your Service → Environment:

```bash
# Required Variables
NODE_ENV=production
PORT=10000
DATABASE_URL=[Auto-filled from PostgreSQL database]
CLERK_SECRET_KEY=sk_test_your-clerk-secret-key
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your-clerk-publishable-key
OPENAI_API_KEY=sk-your-openai-api-key

# Optional Variables (can be added later)
# WEBHOOK_SECRET=your-webhook-secret
# SMTP_HOST=smtp.example.com
```

---

## **🔧 Step 7: Post-Deployment Setup**

### **7.1 Database Migration**

The database schema will be automatically created on first startup. Monitor the deployment logs to ensure success.

### **7.2 Health Check**

After deployment, verify your application:

```bash
# Check health endpoint
curl https://yourapppname.onrender.com/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "database": "connected",
  "version": "1.0.0",
  "environment": "production"
}
```

### **7.3 Test Core Functionality**

1. **Visit Application**: `https://yourapppname.onrender.com`
2. **Test Sign Up/Sign In**: Verify Clerk authentication works
3. **Test Database**: Create a forum, ask a question
4. **Test API**: Check `/api/forums` endpoint

---

## **🌐 Step 8: Custom Domain (Optional)**

### **8.1 Add Custom Domain to Render**

1. In Render Dashboard → Your Service → Settings
2. Add custom domain: `yourdomain.com`
3. Update DNS records as instructed

### **8.2 Update Clerk Settings**

1. In Clerk Dashboard → Domains
2. Add your custom domain
3. Update allowed origins and redirect URLs

---

## **📊 Step 9: Monitoring & Maintenance**

### **9.1 Monitor Application**

- **Health Checks**: Render automatically monitors `/api/health`
- **Logs**: Available in Render Dashboard → Service → Logs
- **Metrics**: Monitor CPU, memory usage in Render Dashboard

### **9.2 Database Monitoring**

- **Neon Console**: Monitor connection count, storage usage
- **Query Performance**: Check slow queries in Neon dashboard

### **9.3 Scaling (If Needed)**

**Upgrade Service Plan:**
- Starter: 0.5 CPU, 512MB RAM
- Standard: 1 CPU, 2GB RAM
- Pro: 2 CPU, 4GB RAM

**Database Scaling:**
- Free: 1GB storage, 1 compute hour
- Starter: 10GB storage, 100 compute hours
- Pro: 100GB storage, 1000 compute hours

---

## **🚨 Troubleshooting**

### **Common Issues**

**Build Failures:**
```bash
# Check package.json scripts
npm run build  # Should work locally

# Check dependencies
npm install    # Ensure all deps installed
```

**Database Connection Issues:**
```bash
# Verify DATABASE_URL format
postgresql://user:pass@host:port/db?sslmode=require

# Check Neon dashboard for connection issues
```

**Authentication Issues:**
```bash
# Verify Clerk keys are correct
# Check Clerk dashboard for domain configuration
# Ensure production URLs are whitelisted
```

**Health Check Failures:**
```bash
# Check if server is running on correct port
curl https://yourapp.onrender.com/api/health

# Check logs for startup errors
```

### **Debugging Commands**

```bash
# Local testing
npm run build    # Test build process
npm start        # Test production start
npm run health   # Test health check

# Check environment
echo $DATABASE_URL
echo $CLERK_SECRET_KEY
```

---

## **🎯 Performance Optimization**

### **Production Optimizations**

1. **Static Asset Caching**: Already configured in Vite build
2. **Gzip Compression**: Enabled by default on Render
3. **Database Connection Pooling**: Handled by Neon
4. **Error Logging**: Comprehensive error handling implemented

### **Monitoring Recommendations**

1. **Set up log alerts** for 500 errors
2. **Monitor response times** for API endpoints
3. **Track database connection count**
4. **Monitor memory usage** during peak traffic

---

## **🎉 Deployment Complete!**

Your GeoFora platform is now live on Render!

**URLs:**
- **Application**: `https://yourapppname.onrender.com`
- **Health Check**: `https://yourapppname.onrender.com/api/health`
- **API Documentation**: `https://yourapppname.onrender.com/api/integration/resources`

**Next Steps:**
1. Set up monitoring and alerts
2. Configure backups (Neon handles this automatically)
3. Plan for scaling based on usage
4. Consider setting up staging environment

---

## **📞 Support**

**Documentation:**
- [Render Docs](https://render.com/docs)
- [Neon Docs](https://neon.tech/docs)
- [Clerk Docs](https://clerk.com/docs)

**Need Help?**
- Check the troubleshooting section above
- Review deployment logs in Render Dashboard
- Verify all environment variables are set correctly