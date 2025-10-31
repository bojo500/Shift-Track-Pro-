# 🚀 ShiftTrackPro - Nginx Proxy Manager Quick Start

Deploy ShiftTrackPro in 15 minutes with existing Nginx Proxy Manager.

---

## ✅ Prerequisites

- HostKey VPS with Ubuntu 22.04
- Nginx Proxy Manager running on port 81
- Domain names pointing to your server IP
- SSH access to your server

---

## 📝 Quick Deployment (6 Steps)

### **Step 1: SSH into Server** (30 seconds)

```bash
ssh root@YOUR_SERVER_IP
```

---

### **Step 2: Clone Repository** (1 minute)

```bash
cd /root
git clone https://github.com/bojo500/Shift-Track-Pro-.git
cd Shift-Track-Pro-
```

---

### **Step 3: Configure Environment** (2 minutes)

```bash
cp .env.npm .env.production
nano .env.production
```

**Change these values**:
- `MYSQL_ROOT_PASSWORD` → Strong password
- `MYSQL_PASSWORD` → Strong password
- `JWT_SECRET` → Random 32+ character string
- `CORS_ORIGINS` → Your frontend domain
- `VITE_API_URL` → Your backend domain

Save: `Ctrl+O`, `Enter`, `Ctrl+X`

---

### **Step 4: Create NPM Network** (30 seconds)

```bash
docker network create npm_network 2>/dev/null || echo "Network already exists"
```

---

### **Step 5: Deploy!** (10 minutes)

```bash
sudo bash deploy-npm.sh
```

Wait for script to complete.

---

### **Step 6: Configure NPM** (3 minutes)

Open: `http://YOUR_SERVER_IP:81`

#### **Add 3 Proxy Hosts:**

**1. Frontend**
- Domain: `shifttrackpro.yourdomain.com`
- Forward to: `shifttrack-frontend:80`
- SSL: ✅ Request New Certificate
- Force SSL: ✅

**2. Backend API**
- Domain: `api.yourdomain.com`
- Forward to: `shifttrack-backend:3000`
- SSL: ✅ Request New Certificate
- Force SSL: ✅

**3. phpMyAdmin**
- Domain: `phpmyadmin.yourdomain.com`
- Forward to: `shifttrack-phpmyadmin:80`
- SSL: ✅ Request New Certificate
- Force SSL: ✅

---

## ✅ Test Your App

Visit:
- Frontend: https://shifttrackpro.yourdomain.com
- API Docs: https://api.yourdomain.com/api/docs
- phpMyAdmin: https://phpmyadmin.yourdomain.com

**Login:**
- Email: `admin@shifttrack.com`
- Password: `Admin@123`

⚠️ **Change password immediately!**

---

## 🛠️ Useful Commands

```bash
cd /root/Shift-Track-Pro-

# View logs
docker-compose -f docker-compose.npm.yml logs -f

# Restart services
docker-compose -f docker-compose.npm.yml restart

# Stop services
docker-compose -f docker-compose.npm.yml down

# Start services
docker-compose -f docker-compose.npm.yml up -d
```

---

## 📚 Full Documentation

For detailed guide with troubleshooting: `NPM_DEPLOYMENT_GUIDE.md`

---

## 🎉 Done!

Your app is live! 🚀

**Ports:**
- Frontend: Internal 3001 → NPM → Your Domain
- Backend: Internal 3000 → NPM → Your Domain
- phpMyAdmin: Internal 8080 → NPM → Your Domain
- MySQL: Internal 3306 (not exposed)
