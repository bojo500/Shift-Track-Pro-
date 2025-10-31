# 🚀 ShiftTrackPro - Nginx Proxy Manager Deployment Guide

Complete step-by-step guide to deploy ShiftTrackPro on HostKey VPS with Nginx Proxy Manager.

---

## 📋 What You Need

1. **HostKey VPS**:
   - 2 CPU cores minimum
   - 4GB RAM minimum
   - 40GB SSD storage
   - Ubuntu 20.04 or 22.04 LTS

2. **Domain Names** (with DNS pointed to your server):
   - `shifttrackpro.yourdomain.com` (Frontend)
   - `api.yourdomain.com` (Backend API)
   - `phpmyadmin.yourdomain.com` (Database Admin)

3. **Nginx Proxy Manager** already installed on port 81

---

## 🎯 Architecture

```
Internet
    ↓
Your Domain DNS → Server IP
    ↓
Nginx Proxy Manager :81 (SSL + Routing)
    ↓
┌─────────────┬──────────────┬──────────────┬──────────────┐
│  Frontend   │  Backend API │    MySQL     │  phpMyAdmin  │
│  Port 3001  │  Port 3000   │  Port 3306   │  Port 8080   │
└─────────────┴──────────────┴──────────────┴──────────────┘
```

**Internal Ports**:
- Frontend: `localhost:3001`
- Backend: `localhost:3000`
- phpMyAdmin: `localhost:8080`
- MySQL: `localhost:3306`

---

## 📝 Step-by-Step Deployment

### **STEP 1: Setup HostKey VPS**

1. **Order VPS** from HostKey.com
2. **Receive credentials** via email:
   - Server IP: `185.xxx.xxx.xxx`
   - Root password
3. **Connect via SSH**:
   ```bash
   ssh root@YOUR_SERVER_IP
   ```

---

### **STEP 2: Install Nginx Proxy Manager** (if not already installed)

If you already have NPM running on port 81, **skip this step**.

```bash
# Create NPM directory
mkdir -p /root/nginx-proxy-manager
cd /root/nginx-proxy-manager

# Create docker-compose.yml for NPM
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  npm:
    image: 'jc21/nginx-proxy-manager:latest'
    restart: unless-stopped
    ports:
      - '80:80'
      - '81:81'
      - '443:443'
    volumes:
      - ./data:/data
      - ./letsencrypt:/etc/letsencrypt
    networks:
      - npm_network

networks:
  npm_network:
    driver: bridge
EOF

# Start NPM
docker-compose up -d

# Wait for NPM to start
sleep 10
```

**Access NPM Dashboard**:
- URL: `http://YOUR_SERVER_IP:81`
- Default Email: `admin@example.com`
- Default Password: `changeme`

**⚠️ Change password immediately after first login!**

---

### **STEP 3: Create NPM Network** (if not exists)

Nginx Proxy Manager needs a shared network to communicate with your apps:

```bash
# Check if network exists
docker network ls | grep npm_network

# If not exists, create it
docker network create npm_network
```

---

### **STEP 4: Point Your Domains to Server**

In your domain registrar's DNS settings, add A records:

| Type | Hostname          | Value              | TTL  |
|------|-------------------|--------------------|------|
| A    | shifttrackpro     | YOUR_SERVER_IP     | 300  |
| A    | api               | YOUR_SERVER_IP     | 300  |
| A    | phpmyadmin        | YOUR_SERVER_IP     | 300  |

**Example** (if your server IP is `185.123.45.67`):
```
A    shifttrackpro.yourdomain.com    185.123.45.67
A    api.yourdomain.com              185.123.45.67
A    phpmyadmin.yourdomain.com       185.123.45.67
```

**Wait 5-10 minutes** for DNS propagation.

**Verify DNS**:
```bash
ping shifttrackpro.yourdomain.com
ping api.yourdomain.com
```

---

### **STEP 5: Clone Repository**

```bash
cd /root
git clone https://github.com/bojo500/Shift-Track-Pro-.git
cd Shift-Track-Pro-
```

---

### **STEP 6: Configure Environment Variables**

```bash
# Copy template
cp .env.npm .env.production

# Edit with nano
nano .env.production
```

**Update these values**:

```bash
# Strong passwords (CHANGE THESE!)
MYSQL_ROOT_PASSWORD=SuperSecureRootPass123!@#
MYSQL_PASSWORD=SuperSecureMysqlPass456!@#

# JWT Secret (minimum 32 characters - CHANGE THIS!)
JWT_SECRET=your_random_jwt_secret_key_32_chars_minimum_xyz789

# CORS Origins (your frontend domain)
CORS_ORIGINS=https://shifttrackpro.yourdomain.com,http://localhost:3001

# API URL (your backend domain)
VITE_API_URL=https://api.yourdomain.com
```

**Save and exit**:
- Press `Ctrl + O` → `Enter` → `Ctrl + X`

---

### **STEP 7: Configure Firewall**

```bash
# Enable firewall
ufw --force enable

# Allow SSH (CRITICAL - don't lock yourself out!)
ufw allow 22/tcp

# Allow HTTP, HTTPS, and NPM
ufw allow 80/tcp
ufw allow 81/tcp
ufw allow 443/tcp

# Check status
ufw status
```

---

### **STEP 8: Install Docker & Docker Compose** (if not installed)

```bash
# Check if Docker is installed
docker --version

# If not installed, install Docker
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl start docker
    systemctl enable docker
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Verify installation
docker --version
docker-compose --version
```

---

### **STEP 9: Deploy ShiftTrackPro**

```bash
# Make sure you're in project directory
cd /root/Shift-Track-Pro-

# Stop any existing containers
docker-compose -f docker-compose.npm.yml down 2>/dev/null || true

# Build images (takes 5-10 minutes)
docker-compose -f docker-compose.npm.yml build --no-cache

# Start services
docker-compose -f docker-compose.npm.yml up -d

# Wait for database to initialize
echo "Waiting for database to be ready..."
sleep 30

# Run database migrations
docker-compose -f docker-compose.npm.yml exec -T backend npm run migration:run 2>/dev/null || echo "No migrations to run"

# Seed initial data
docker-compose -f docker-compose.npm.yml exec -T backend npm run seed || echo "Already seeded"

# Check status
docker-compose -f docker-compose.npm.yml ps
```

**You should see 4 containers running**:
- `shifttrack-mysql` (database)
- `shifttrack-backend` (API)
- `shifttrack-frontend` (web app)
- `shifttrack-phpmyadmin` (database admin)

---

### **STEP 10: Configure Nginx Proxy Manager**

Now configure NPM to route traffic to your containers:

#### **1. Access NPM Dashboard**
- Open browser: `http://YOUR_SERVER_IP:81`
- Login with your credentials

#### **2. Add Frontend Proxy**

Click **"Hosts"** → **"Proxy Hosts"** → **"Add Proxy Host"**

**Details Tab**:
- **Domain Names**: `shifttrackpro.yourdomain.com`
- **Scheme**: `http`
- **Forward Hostname/IP**: `shifttrack-frontend`
- **Forward Port**: `80`
- **Cache Assets**: ✅ On
- **Block Common Exploits**: ✅ On
- **Websockets Support**: ✅ On

**SSL Tab**:
- **SSL Certificate**: Request a New SSL Certificate
- **Force SSL**: ✅ On
- **HTTP/2 Support**: ✅ On
- **HSTS Enabled**: ✅ On
- **Email**: your-email@example.com
- **I Agree**: ✅ Check the terms

Click **Save**

#### **3. Add Backend API Proxy**

Click **"Add Proxy Host"** again

**Details Tab**:
- **Domain Names**: `api.yourdomain.com`
- **Scheme**: `http`
- **Forward Hostname/IP**: `shifttrack-backend`
- **Forward Port**: `3000`
- **Cache Assets**: ❌ Off (important for API)
- **Block Common Exploits**: ✅ On
- **Websockets Support**: ✅ On

**Custom Locations** (Optional - for better API routing):
- Location: `/`
- Forward Hostname/IP: `shifttrack-backend`
- Forward Port: `3000`

**SSL Tab**:
- **SSL Certificate**: Request a New SSL Certificate
- **Force SSL**: ✅ On
- **HTTP/2 Support**: ✅ On
- **HSTS Enabled**: ✅ On

Click **Save**

#### **4. Add phpMyAdmin Proxy**

Click **"Add Proxy Host"** again

**Details Tab**:
- **Domain Names**: `phpmyadmin.yourdomain.com`
- **Scheme**: `http`
- **Forward Hostname/IP**: `shifttrack-phpmyadmin`
- **Forward Port**: `80`
- **Block Common Exploits**: ✅ On

**SSL Tab**:
- **SSL Certificate**: Request a New SSL Certificate
- **Force SSL**: ✅ On
- **HTTP/2 Support**: ✅ On

Click **Save**

---

### **STEP 11: Test Your Application**

Open browser and test all services:

#### **1. Frontend**
```
https://shifttrackpro.yourdomain.com
```
✅ Should show landing page with "ShiftTrackPro"

#### **2. Login Page**
```
https://shifttrackpro.yourdomain.com/login
```
✅ Should show login form

#### **3. Backend API Documentation**
```
https://api.yourdomain.com/api/docs
```
✅ Should show Swagger API docs

#### **4. phpMyAdmin**
```
https://phpmyadmin.yourdomain.com
```
✅ Should show phpMyAdmin login
- **Server**: `mysql`
- **Username**: `shifttrack`
- **Password**: (your MYSQL_PASSWORD from .env.production)

---

### **STEP 12: Login and Verify**

**Default SuperAdmin Login**:
- **Email**: `admin@shifttrack.com`
- **Password**: `Admin@123`

**⚠️ CHANGE PASSWORD IMMEDIATELY!**

**Test Features**:
1. ✅ Login as SuperAdmin
2. ✅ Create a Worker user
3. ✅ Create a shift record (CCS section)
4. ✅ View Reports page
5. ✅ Check data in phpMyAdmin

---

## 🔐 Security Recommendations

### **1. Change Default Passwords**
```bash
# Change admin password in app
# Change NPM admin password
# Use strong MySQL passwords
```

### **2. Setup Automatic Backups**

Create backup script:
```bash
nano /root/backup-shifttrack.sh
```

Add:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR

# Get MySQL password from .env
cd /root/Shift-Track-Pro-
source .env.production

# Backup database
docker exec shifttrack-mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD shifttrackpro > $BACKUP_DIR/db_backup_$DATE.sql

# Compress
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: db_backup_$DATE.sql.gz"
```

Make executable:
```bash
chmod +x /root/backup-shifttrack.sh
```

Add to crontab (daily at 2 AM):
```bash
crontab -e

# Add this line:
0 2 * * * /root/backup-shifttrack.sh >> /var/log/backup.log 2>&1
```

### **3. Monitor Resources**

```bash
# Check disk space
df -h

# Check Docker resources
docker stats

# Check container logs
docker-compose -f docker-compose.npm.yml logs -f
```

---

## 🛠️ Management Commands

### **View Logs**
```bash
cd /root/Shift-Track-Pro-

# All services
docker-compose -f docker-compose.npm.yml logs -f

# Specific service
docker-compose -f docker-compose.npm.yml logs -f backend
docker-compose -f docker-compose.npm.yml logs -f frontend
docker-compose -f docker-compose.npm.yml logs -f mysql
```

### **Restart Services**
```bash
# Restart all
docker-compose -f docker-compose.npm.yml restart

# Restart specific service
docker-compose -f docker-compose.npm.yml restart backend
```

### **Stop Services**
```bash
docker-compose -f docker-compose.npm.yml down
```

### **Start Services**
```bash
docker-compose -f docker-compose.npm.yml up -d
```

### **Update Application**
```bash
cd /root/Shift-Track-Pro-

# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.npm.yml down
docker-compose -f docker-compose.npm.yml build --no-cache
docker-compose -f docker-compose.npm.yml up -d

# Check status
docker-compose -f docker-compose.npm.yml ps
```

### **Database Access**
```bash
# Via command line
docker exec -it shifttrack-mysql mysql -u root -p

# Or use phpMyAdmin web interface
https://phpmyadmin.yourdomain.com
```

---

## 🐛 Troubleshooting

### **Issue 1: Can't Access Website**

**Check DNS**:
```bash
ping shifttrackpro.yourdomain.com
```

**Check containers are running**:
```bash
docker-compose -f docker-compose.npm.yml ps
```

**Check NPM is running**:
```bash
docker ps | grep nginx-proxy-manager
```

**Check firewall**:
```bash
ufw status
```

### **Issue 2: SSL Certificate Fails**

**In NPM Dashboard**:
1. Delete existing SSL certificate
2. Wait 5 minutes
3. Request new certificate
4. Make sure DNS is pointing to your server IP

**Check DNS propagation**:
```bash
nslookup shifttrackpro.yourdomain.com
```

### **Issue 3: Backend Can't Connect to Database**

**Check database is running**:
```bash
docker exec -it shifttrack-mysql mysql -u root -p
```

**Check backend logs**:
```bash
docker-compose -f docker-compose.npm.yml logs backend
```

**Verify environment variables**:
```bash
docker exec shifttrack-backend env | grep DB_
```

### **Issue 4: Frontend Shows "Cannot Connect to API"**

**Check CORS configuration**:
```bash
nano .env.production

# Make sure CORS_ORIGINS includes your frontend domain
CORS_ORIGINS=https://shifttrackpro.yourdomain.com
```

**Restart backend**:
```bash
docker-compose -f docker-compose.npm.yml restart backend
```

**Test API directly**:
```bash
curl https://api.yourdomain.com/api/docs
```

### **Issue 5: Containers Won't Start**

**Check logs**:
```bash
docker-compose -f docker-compose.npm.yml logs
```

**Check port conflicts**:
```bash
netstat -tulpn | grep -E '3000|3001|8080|3306'
```

**Recreate containers**:
```bash
docker-compose -f docker-compose.npm.yml down -v
docker-compose -f docker-compose.npm.yml up -d
```

---

## 📊 Port Reference

| Service       | Internal Port | External Access                          |
|---------------|---------------|------------------------------------------|
| Frontend      | 3001          | https://shifttrackpro.yourdomain.com     |
| Backend API   | 3000          | https://api.yourdomain.com               |
| phpMyAdmin    | 8080          | https://phpmyadmin.yourdomain.com        |
| MySQL         | 3306          | localhost only (not exposed)             |
| NPM Dashboard | 81            | http://YOUR_SERVER_IP:81                 |

---

## 💰 Cost Estimate

| Item              | Cost/Month  |
|-------------------|-------------|
| HostKey VPS       | $10-15      |
| Domain (optional) | $10-15/year |
| SSL Certificates  | FREE        |
| **Total**         | **~$10-15** |

---

## ✅ Deployment Checklist

- [ ] HostKey VPS ordered and accessible
- [ ] Nginx Proxy Manager installed on port 81
- [ ] DNS records pointing to server IP
- [ ] Domain names verified (ping test)
- [ ] NPM network created (`npm_network`)
- [ ] Repository cloned
- [ ] `.env.production` configured
- [ ] Firewall configured (ports 22, 80, 81, 443)
- [ ] Docker containers built and running
- [ ] Database seeded with initial data
- [ ] Frontend proxy configured in NPM
- [ ] Backend proxy configured in NPM
- [ ] phpMyAdmin proxy configured in NPM
- [ ] SSL certificates working
- [ ] Frontend accessible
- [ ] Backend API accessible
- [ ] phpMyAdmin accessible
- [ ] Default admin password changed
- [ ] Backup script configured

---

## 🎉 Success!

Your ShiftTrackPro application is now live with:

✅ **Nginx Proxy Manager** for SSL and routing
✅ **Automatic SSL certificates** via Let's Encrypt
✅ **Docker containerization** for easy management
✅ **MySQL 8.0** database
✅ **phpMyAdmin** web interface
✅ **Production-ready** configuration

**Your Live URLs**:
- 🌐 Frontend: https://shifttrackpro.yourdomain.com
- 🔧 Backend API: https://api.yourdomain.com
- 📚 Swagger Docs: https://api.yourdomain.com/api/docs
- 🗄️ phpMyAdmin: https://phpmyadmin.yourdomain.com
- ⚙️ NPM Dashboard: http://YOUR_SERVER_IP:81

**Enjoy your production app! 🚀**
