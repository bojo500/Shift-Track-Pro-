# 🚀 ShiftTrackPro - Render Deployment Guide

Complete guide to deploy ShiftTrackPro on Render with Cloudflare DNS.

## 📋 Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Cloudflare Account**: For DNS management at [cloudflare.com](https://cloudflare.com)
4. **Domain**: mk-codes.com already registered and added to Cloudflare

---

## 🎯 Deployment Architecture

```
User (Browser)
    ↓
Cloudflare DNS (shifttrackpro.mk-codes.com)
    ↓
Render Frontend (Static Site)
    ↓ API Calls
Render Backend (Web Service)
    ↓
Render MySQL Database (Private Service)
    ↑
phpMyAdmin (Docker Service)
```

---

## 📦 Step 1: Push to GitHub

```bash
cd /Users/mohamedkhaled/ShiftTrackPro
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

---

## 🗄️ Step 2: Create MySQL Database

1. **Go to Render Dashboard** → **New** → **Private Service**
2. **Configure Service**:
   - **Type**: Docker
   - **Name**: `shifttrackpro-db`
   - **Dockerfile Path**: `./Dockerfile.mysql`
   - **Plan**: Starter ($7/month)
   - **Disk**: 10GB persistent storage at `/var/lib/mysql`

3. **Add Environment Variables**:
   ```
   MYSQL_ROOT_PASSWORD=<generate-secure-password>
   MYSQL_DATABASE=shifttrackpro
   MYSQL_USER=shifttrack
   MYSQL_PASSWORD=<generate-secure-password>
   ```

4. **Create Service** → Wait for deployment
5. **Save Internal URL**: `shifttrackpro-db:3306`

---

## 🔧 Step 3: Create Backend API

1. **Go to Render Dashboard** → **New** → **Web Service**
2. **Connect GitHub Repository**: Select your ShiftTrackPro repo
3. **Configure Service**:
   - **Name**: `shifttrackpro-api`
   - **Region**: Oregon (or closest to you)
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Plan**: Starter ($7/month)
   - **Health Check Path**: `/api/health` (if you have a health endpoint)

4. **Add Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3000

   # Database (use internal connection)
   DB_HOST=shifttrackpro-db
   DB_PORT=3306
   DB_USERNAME=shifttrack
   DB_PASSWORD=<same-as-database-password>
   DB_DATABASE=shifttrackpro

   # JWT
   JWT_SECRET=<generate-random-string-min-32-chars>
   JWT_EXPIRES_IN=24h

   # CORS
   CORS_ORIGINS=https://shifttrackpro.mk-codes.com,https://shifttrackpro-frontend.onrender.com
   ```

5. **Create Service** → Wait for deployment
6. **Save Public URL**: `https://shifttrackpro-api.onrender.com`

---

## 🎨 Step 4: Create Frontend

1. **Go to Render Dashboard** → **New** → **Static Site**
2. **Connect GitHub Repository**: Select your ShiftTrackPro repo
3. **Configure Service**:
   - **Name**: `shifttrackpro-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: Free

4. **Add Environment Variables**:
   ```
   VITE_API_URL=https://shifttrackpro-api.onrender.com
   ```

5. **Advanced Settings** → **Rewrite Rules**:
   ```
   /*  /index.html  200
   ```
   (This is for React Router to work correctly)

6. **Create Service** → Wait for deployment
7. **Save Public URL**: `https://shifttrackpro-frontend.onrender.com`

---

## 🗂️ Step 5: Create phpMyAdmin (Optional)

1. **Go to Render Dashboard** → **New** → **Web Service**
2. **Configure Service**:
   - **Type**: Docker
   - **Name**: `shifttrackpro-phpmyadmin`
   - **Dockerfile Path**: `./Dockerfile.phpmyadmin`
   - **Plan**: Starter ($7/month)

3. **Add Environment Variables**:
   ```
   PMA_HOST=shifttrackpro-db
   PMA_PORT=3306
   PMA_USER=shifttrack
   PMA_PASSWORD=<same-as-database-password>
   UPLOAD_LIMIT=50M
   ```

4. **Create Service** → Wait for deployment
5. **Save Public URL**: `https://shifttrackpro-phpmyadmin.onrender.com`

---

## 🌐 Step 6: Configure Cloudflare DNS

1. **Log into Cloudflare Dashboard**
2. **Select Domain**: mk-codes.com
3. **Go to DNS** → **Add Records**

### Add CNAME Records:

| Type  | Name           | Target                                        | Proxy Status |
|-------|----------------|-----------------------------------------------|--------------|
| CNAME | shifttrackpro  | shifttrackpro-frontend.onrender.com          | Proxied ✅   |
| CNAME | api            | shifttrackpro-api.onrender.com               | DNS Only ⚠️  |
| CNAME | phpmyadmin     | shifttrackpro-phpmyadmin.onrender.com        | DNS Only ⚠️  |

**Important**:
- Frontend should be **Proxied** (orange cloud) for CDN benefits
- Backend API should be **DNS Only** (gray cloud) to avoid WebSocket issues
- phpMyAdmin should be **DNS Only** for direct connection

4. **Wait 2-5 minutes** for DNS propagation

---

## 🔐 Step 7: Update CORS Origins

After DNS is configured, update backend environment variables:

1. **Go to Render** → **shifttrackpro-api** → **Environment**
2. **Update CORS_ORIGINS**:
   ```
   CORS_ORIGINS=https://shifttrackpro.mk-codes.com,https://shifttrackpro-frontend.onrender.com
   ```
3. **Save** → Service will auto-redeploy

---

## 🔐 Step 8: Update Frontend API URL

1. **Go to Render** → **shifttrackpro-frontend** → **Environment**
2. **Update VITE_API_URL**:
   ```
   VITE_API_URL=https://api.mk-codes.com
   ```
   OR if you prefer subdomain:
   ```
   VITE_API_URL=https://shifttrackpro-api.onrender.com
   ```
3. **Save** → Trigger Manual Deploy

---

## ✅ Step 9: Verify Deployment

### Test Each Service:

1. **Frontend**: https://shifttrackpro.mk-codes.com
   - Should load landing page
   - Should navigate to login

2. **Backend API**: https://api.mk-codes.com/api/docs
   - Should show Swagger documentation

3. **phpMyAdmin**: https://phpmyadmin.mk-codes.com
   - Should show login page
   - Login with database credentials

### Test Full Flow:
1. Visit https://shifttrackpro.mk-codes.com
2. Click "Get Started"
3. Login with default SuperAdmin:
   - Email: `admin@shifttrack.com`
   - Password: `Admin@123`
4. Create records, view reports
5. Check database in phpMyAdmin

---

## 🐛 Troubleshooting

### Frontend Can't Connect to Backend

**Problem**: CORS errors in browser console

**Solution**:
1. Check `CORS_ORIGINS` includes your frontend URL
2. Make sure API URL in frontend matches actual backend URL
3. Check backend logs on Render

### Database Connection Failed

**Problem**: Backend can't connect to database

**Solution**:
1. Verify `DB_HOST=shifttrackpro-db` (internal hostname)
2. Check database service is running
3. Verify DB credentials match in both services
4. Check backend logs: Render Dashboard → shifttrackpro-api → Logs

### Build Failed

**Problem**: Build command fails on Render

**Solution**:
1. Check build logs for specific error
2. Verify package.json has correct scripts
3. Make sure node version is compatible (18+)
4. Try adding `NODE_VERSION=18` environment variable

### React Router 404 Errors

**Problem**: Refreshing on routes gives 404

**Solution**:
Add rewrite rule in Render static site settings:
```
/*  /index.html  200
```

### phpMyAdmin Can't Connect

**Problem**: phpMyAdmin shows connection error

**Solution**:
1. Use internal hostname: `PMA_HOST=shifttrackpro-db`
2. Don't use external URL for database
3. Verify credentials match database service

### Free Tier Limitations

**Problem**: Services go to sleep after 15 minutes

**Solution**:
- Upgrade to paid plan ($7/month per service)
- Or use a cron job to ping services every 10 minutes
- Or accept the cold start delay (20-30 seconds)

---

## 💰 Cost Breakdown

| Service              | Plan      | Cost/Month |
|----------------------|-----------|------------|
| Frontend (Static)    | Free      | $0         |
| Backend API          | Starter   | $7         |
| MySQL Database       | Starter   | $7         |
| phpMyAdmin           | Starter   | $7         |
| **Total**            |           | **$21/mo** |

**Optimization**: You can skip phpMyAdmin and use a local MySQL client to save $7/month.

---

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit sensitive data
2. **JWT Secret**: Use strong random string (32+ chars)
3. **Database Password**: Use strong password
4. **CORS**: Only allow your frontend domain
5. **phpMyAdmin**: Consider restricting access with authentication
6. **HTTPS**: Cloudflare provides free SSL
7. **Firewall**: Keep database as private service

---

## 🚀 Continuous Deployment

Render automatically deploys when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main

# Render automatically:
# 1. Detects push
# 2. Builds services
# 3. Deploys updates
# 4. Zero downtime
```

---

## 📊 Monitoring

### View Logs:
1. Render Dashboard → Select Service
2. Click **Logs** tab
3. View real-time logs

### View Metrics:
1. Render Dashboard → Select Service
2. Click **Metrics** tab
3. View CPU, Memory, Network usage

### Email Alerts:
Render sends email alerts for:
- Deploy failures
- Service crashes
- High resource usage

---

## 🆘 Need Help?

- **Render Docs**: https://render.com/docs
- **Cloudflare DNS Docs**: https://developers.cloudflare.com/dns/
- **ShiftTrackPro Issues**: Check backend/frontend logs first

---

## 📝 Summary

Your app is now live at:

- **Main App**: https://shifttrackpro.mk-codes.com
- **API**: https://api.mk-codes.com or https://shifttrackpro-api.onrender.com
- **phpMyAdmin**: https://phpmyadmin.mk-codes.com

✅ SSL Enabled (Cloudflare)
✅ Automatic Deployments (GitHub)
✅ Database Backups (Render)
✅ CDN (Cloudflare)
✅ Zero Downtime Deployments

**Enjoy your production app! 🎉**
