# 🚀 ShiftTrackPro - HostKey VPS Deployment Guide

Complete step-by-step guide to deploy ShiftTrackPro on HostKey.com VPS with Cloudflare DNS.

---

## 📋 Prerequisites

1. **HostKey VPS Account**: https://hostkey.com/
2. **Recommended VPS Plan**:
   - 2 CPU cores minimum
   - 4GB RAM minimum
   - 40GB SSD storage minimum
   - Ubuntu 20.04 or 22.04 LTS
3. **Domain**: mk-codes.com (registered and added to Cloudflare)
4. **Cloudflare Account**: For DNS management
5. **SSH Client**: Terminal (Mac/Linux) or PuTTY (Windows)

---

## 📦 What You'll Deploy

- ✅ **Frontend**: React + Vite + TailwindCSS
- ✅ **Backend API**: NestJS + TypeORM
- ✅ **Database**: MySQL 8.0
- ✅ **phpMyAdmin**: Database management interface
- ✅ **Traefik**: Reverse proxy with automatic SSL
- ✅ **Docker**: Containerized deployment

---

## 🎯 Architecture

```
Internet
    ↓
Cloudflare DNS (mk-codes.com)
    ↓
HostKey VPS (Your Server IP)
    ↓
Traefik (Reverse Proxy + SSL)
    ↓
┌─────────────┬──────────────┬──────────────┬──────────────┐
│  Frontend   │  Backend API │    MySQL     │  phpMyAdmin  │
│  (Nginx)    │  (NestJS)    │  (Database)  │  (Web GUI)   │
└─────────────┴──────────────┴──────────────┴──────────────┘
```

**URLs After Deployment**:
- Frontend: https://shifttrackpro.mk-codes.com
- Backend API: https://api.mk-codes.com
- API Docs: https://api.mk-codes.com/api/docs
- phpMyAdmin: https://phpmyadmin.shifttrackpro.mk-codes.com
- Traefik Dashboard: https://traefik.shifttrackpro.mk-codes.com

---

## 📝 Step-by-Step Deployment

### **STEP 1: Order and Setup HostKey VPS**

1. **Go to HostKey.com** and create an account
2. **Order a VPS**:
   - Choose location (closest to your users)
   - Select Ubuntu 22.04 LTS
   - Choose plan: At least 2 CPU + 4GB RAM
   - Complete payment

3. **Receive VPS Credentials**:
   - You'll receive an email with:
     - Server IP address (e.g., `185.xxx.xxx.xxx`)
     - Root password
     - SSH port (usually 22)

4. **Save these details** - you'll need them!

---

### **STEP 2: Connect to Your VPS via SSH**

#### **On Mac/Linux:**
```bash
ssh root@YOUR_SERVER_IP
```

#### **On Windows:**
1. Download **PuTTY**: https://www.putty.org/
2. Open PuTTY
3. Enter your server IP
4. Click "Open"
5. Login as `root` with your password

**First Time Login:**
- Type `yes` when asked about fingerprint
- Enter the root password from email
- You should see a command prompt like: `root@hostname:~#`

---

### **STEP 3: Configure Cloudflare DNS**

Before deploying, set up DNS records:

1. **Login to Cloudflare Dashboard**
2. **Select domain**: mk-codes.com
3. **Go to DNS** → **Manage DNS**
4. **Add these A Records**:

| Type | Name           | Content            | Proxy Status | TTL  |
|------|----------------|--------------------|--------------|------|
| A    | shifttrackpro  | YOUR_SERVER_IP     | Proxied ✅   | Auto |
| A    | api            | YOUR_SERVER_IP     | DNS Only ⚠️  | Auto |
| A    | phpmyadmin     | YOUR_SERVER_IP     | DNS Only ⚠️  | Auto |
| A    | traefik        | YOUR_SERVER_IP     | DNS Only ⚠️  | Auto |

**Example** (if your server IP is `185.123.45.67`):
```
A    shifttrackpro    185.123.45.67    Proxied
A    api              185.123.45.67    DNS Only
```

**Important Notes**:
- **Proxied (Orange Cloud)**: Use for frontend to get Cloudflare CDN benefits
- **DNS Only (Gray Cloud)**: Use for API/backend to avoid Cloudflare WebSocket issues

5. **Wait 2-5 minutes** for DNS propagation

6. **Verify DNS** (on your local machine):
```bash
ping shifttrackpro.mk-codes.com
ping api.mk-codes.com
```
You should see your server IP in the response.

---

### **STEP 4: Get Cloudflare API Token for SSL**

Traefik needs a Cloudflare API token to automatically generate SSL certificates:

1. **Go to**: https://dash.cloudflare.com/profile/api-tokens
2. **Click**: "Create Token"
3. **Select**: "Edit zone DNS" template
4. **Permissions**:
   - Zone - DNS - Edit
   - Zone - Zone - Read
5. **Zone Resources**:
   - Include - Specific zone - mk-codes.com
6. **Create Token** and **copy it** (you'll need it in .env.production)

---

### **STEP 5: Clone Repository on VPS**

On your VPS (SSH connection), run:

```bash
# Navigate to home directory
cd /root

# Clone your repository
git clone https://github.com/bojo500/Shift-Track-Pro-.git

# Enter project directory
cd Shift-Track-Pro-

# Verify files
ls -la
```

You should see: `backend/`, `frontend/`, `docker-compose.prod.yml`, `deploy-hostkey.sh`, etc.

---

### **STEP 6: Configure Environment Variables**

Create production environment file:

```bash
# Copy template
cp .env.hostkey .env.production

# Edit with nano editor
nano .env.production
```

**Edit these values** (use arrow keys to navigate, type to edit):

```bash
# MySQL Passwords (CHANGE THESE!)
MYSQL_ROOT_PASSWORD=your_super_secure_root_password_here_123!
MYSQL_PASSWORD=your_super_secure_mysql_password_here_456!

# JWT Secret (CHANGE THIS - at least 32 characters!)
JWT_SECRET=your_random_jwt_secret_key_min_32_chars_xyz789!

# Domain Configuration
DOMAIN=mk-codes.com
SUBDOMAIN=shifttrackpro

# Your Cloudflare Email
ACME_EMAIL=your-email@gmail.com

# Cloudflare API Token (from Step 4)
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token_here

# Frontend API URL
VITE_API_URL=https://api.mk-codes.com
```

**Save and Exit**:
- Press `Ctrl + O` to save
- Press `Enter` to confirm
- Press `Ctrl + X` to exit

---

### **STEP 7: Generate Traefik Dashboard Password**

Generate secure password for Traefik dashboard:

```bash
# Install apache2-utils
apt-get install -y apache2-utils

# Generate password (replace 'your_password' with your desired password)
echo $(htpasswd -nb admin your_password)
```

**Copy the output** (looks like: `admin:$apr1$H6uskkkW$IgXLP6ewTrSuBkTrqE8wj/`)

**Add to .env.production**:
```bash
nano .env.production

# Find TRAEFIK_AUTH and replace with your generated hash
# Make sure to use double $$ like: $$apr1$$
TRAEFIK_AUTH=admin:$$apr1$$H6uskkkW$$IgXLP6ewTrSuBkTrqE8wj/
```

**Save**: `Ctrl + O`, `Enter`, `Ctrl + X`

---

### **STEP 8: Update Traefik Configuration**

Edit Traefik config with your email:

```bash
nano traefik/traefik.yml
```

**Change this line**:
```yaml
certificatesResolvers:
  cloudflare:
    acme:
      email: your-email@mk-codes.com  # ← CHANGE THIS
```

**Save**: `Ctrl + O`, `Enter`, `Ctrl + X`

---

### **STEP 9: Configure Firewall (UFW)**

Open required ports:

```bash
# Enable firewall
ufw --force enable

# Allow SSH (IMPORTANT - don't lock yourself out!)
ufw allow 22/tcp

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Check status
ufw status

# You should see:
# 22/tcp     ALLOW       Anywhere
# 80/tcp     ALLOW       Anywhere
# 443/tcp    ALLOW       Anywhere
```

---

### **STEP 10: Run Deployment Script**

Now run the automated deployment script:

```bash
# Make sure you're in the project directory
cd /root/Shift-Track-Pro-

# Run deployment script
sudo bash deploy-hostkey.sh
```

**What the script does**:
1. ✅ Updates system packages
2. ✅ Installs Docker and Docker Compose
3. ✅ Installs Git
4. ✅ Sets up SSL certificate storage
5. ✅ Builds Docker images (takes 5-10 minutes)
6. ✅ Starts all services
7. ✅ Waits for database
8. ✅ Runs database migrations
9. ✅ Seeds initial data (SuperAdmin, Sections, Shifts)
10. ✅ Shows deployment status

**⏱️ This takes about 10-15 minutes on first run.**

---

### **STEP 11: Verify Deployment**

After script completes:

```bash
# Check all containers are running
docker-compose -f docker-compose.prod.yml ps

# You should see 5 containers running:
# - traefik
# - shifttrack-mysql
# - shifttrack-backend
# - shifttrack-frontend
# - shifttrack-phpmyadmin
```

**Check logs** if any container is not running:
```bash
# Backend logs
docker-compose -f docker-compose.prod.yml logs backend

# Frontend logs
docker-compose -f docker-compose.prod.yml logs frontend

# Database logs
docker-compose -f docker-compose.prod.yml logs mysql
```

---

### **STEP 12: Test Your Application**

Open a web browser and visit:

#### **1. Frontend** (Landing Page):
```
https://shifttrackpro.mk-codes.com
```
✅ Should show ShiftTrackPro landing page

#### **2. Login Page**:
```
https://shifttrackpro.mk-codes.com/login
```
✅ Should show login form

#### **3. Backend API Documentation**:
```
https://api.mk-codes.com/api/docs
```
✅ Should show Swagger API documentation

#### **4. phpMyAdmin**:
```
https://phpmyadmin.shifttrackpro.mk-codes.com
```
✅ Should show phpMyAdmin login
- Server: `mysql`
- Username: `shifttrack`
- Password: (your MYSQL_PASSWORD from .env.production)

#### **5. Traefik Dashboard**:
```
https://traefik.shifttrackpro.mk-codes.com
```
✅ Should ask for authentication
- Username: `admin`
- Password: (password you set in Step 7)

---

### **STEP 13: Login and Test**

**Default SuperAdmin Credentials**:
- Email: `admin@shifttrack.com`
- Password: `Admin@123`

**⚠️ IMPORTANT: Change this password immediately after first login!**

**Test the application**:
1. Login as SuperAdmin
2. Create a Worker user
3. Create a shift record
4. View Reports page
5. Check phpMyAdmin for data

---

## 🔐 Security Best Practices

### **1. Change Default Passwords**

```bash
# Login to your app and change admin password through UI
```

### **2. Update System Regularly**

```bash
# Run monthly
apt-get update && apt-get upgrade -y
```

### **3. Setup Automatic Backups**

Create backup script:

```bash
nano /root/backup-shifttrack.sh
```

Add this content:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR

# Backup database
docker exec shifttrack-mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD shifttrackpro > $BACKUP_DIR/db_backup_$DATE.sql

# Compress
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: db_backup_$DATE.sql.gz"
```

Make executable and add to cron:

```bash
chmod +x /root/backup-shifttrack.sh

# Run daily at 2 AM
crontab -e

# Add this line:
0 2 * * * /root/backup-shifttrack.sh >> /var/log/backup.log 2>&1
```

### **4. Monitor Disk Space**

```bash
# Check disk usage
df -h

# Check Docker space
docker system df
```

### **5. Enable Fail2Ban (Optional)**

Protect against brute-force attacks:

```bash
apt-get install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

---

## 🛠️ Common Management Commands

### **View Logs**

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f mysql
```

### **Restart Services**

```bash
# Restart all
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend
```

### **Stop Services**

```bash
docker-compose -f docker-compose.prod.yml down
```

### **Start Services**

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### **Update Application Code**

```bash
cd /root/Shift-Track-Pro-

# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### **Database Access**

```bash
# Connect to MySQL
docker exec -it shifttrack-mysql mysql -u root -p

# Or use phpMyAdmin:
# https://phpmyadmin.shifttrackpro.mk-codes.com
```

### **Clean Docker Resources**

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Full cleanup (⚠️ careful - removes stopped containers too)
docker system prune -a --volumes
```

---

## 🐛 Troubleshooting

### **Issue 1: Containers Keep Restarting**

**Check logs**:
```bash
docker-compose -f docker-compose.prod.yml logs backend
```

**Common causes**:
- Database not ready → Wait 30 seconds and check again
- Wrong environment variables → Check `.env.production`
- Port conflicts → Make sure ports 80, 443 are not used

### **Issue 2: Can't Access Website (Connection Timeout)**

**Checklist**:
1. ✅ DNS records pointing to correct IP?
   ```bash
   ping shifttrackpro.mk-codes.com
   ```
2. ✅ Firewall allows ports 80, 443?
   ```bash
   ufw status
   ```
3. ✅ Traefik container running?
   ```bash
   docker ps | grep traefik
   ```
4. ✅ Check Traefik logs:
   ```bash
   docker logs traefik
   ```

### **Issue 3: SSL Certificate Not Working**

**Check Traefik logs**:
```bash
docker logs traefik | grep acme
```

**Common causes**:
- Wrong Cloudflare API token → Check `.env.production`
- Wrong email in `traefik/traefik.yml`
- DNS not propagated yet → Wait 10 minutes

**Force SSL renewal**:
```bash
docker-compose -f docker-compose.prod.yml down
rm traefik/acme.json
touch traefik/acme.json
chmod 600 traefik/acme.json
docker-compose -f docker-compose.prod.yml up -d
```

### **Issue 4: Backend Can't Connect to Database**

**Check database is running**:
```bash
docker exec shifttrack-mysql mysql -u root -p
```

**Check environment variables**:
```bash
docker exec shifttrack-backend env | grep DB_
```

**Should show**:
```
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=shifttrack
DB_PASSWORD=<your-password>
DB_DATABASE=shifttrackpro
```

### **Issue 5: Out of Disk Space**

**Check space**:
```bash
df -h
docker system df
```

**Clean up**:
```bash
# Remove old images
docker image prune -a

# Remove old logs (if > 1GB)
truncate -s 0 /var/lib/docker/containers/*/*-json.log
```

### **Issue 6: High Memory Usage**

**Check resource usage**:
```bash
docker stats
```

**Restart services**:
```bash
docker-compose -f docker-compose.prod.yml restart
```

---

## 📊 Monitoring

### **System Resources**

```bash
# CPU and Memory
htop

# Disk usage
df -h

# Docker resources
docker stats
```

### **Application Health**

```bash
# Check all containers status
docker-compose -f docker-compose.prod.yml ps

# Backend health
curl https://api.mk-codes.com/api/health

# Frontend health
curl https://shifttrackpro.mk-codes.com/health
```

---

## 🔄 Continuous Deployment (Optional)

Setup webhook for automatic deployment when you push to GitHub:

1. **Install webhook**:
```bash
apt-get install -y webhook
```

2. **Create webhook script**:
```bash
nano /root/auto-deploy.sh
```

Add:
```bash
#!/bin/bash
cd /root/Shift-Track-Pro-
git pull origin main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

3. **Make executable**:
```bash
chmod +x /root/auto-deploy.sh
```

4. **Configure GitHub webhook** in your repository settings

---

## 💰 Cost Estimate (HostKey VPS)

| Resource          | Specification       | Monthly Cost |
|-------------------|---------------------|--------------|
| VPS (2 CPU/4GB)   | Ubuntu 22.04        | $10-15       |
| Domain (optional) | mk-codes.com        | $0 (owned)   |
| Cloudflare        | Free Plan           | $0           |
| SSL Certificates  | Let's Encrypt       | $0           |
| **Total**         |                     | **$10-15/mo**|

Much cheaper than Render ($21/month)!

---

## 📞 Support

### **HostKey Support**:
- Website: https://hostkey.com/support
- Email: support@hostkey.com

### **Application Issues**:
- Check logs first: `docker-compose -f docker-compose.prod.yml logs`
- Review this guide's troubleshooting section

---

## ✅ Deployment Checklist

Use this checklist to ensure everything is configured:

- [ ] HostKey VPS ordered and accessible via SSH
- [ ] DNS records configured in Cloudflare
- [ ] Cloudflare API token generated
- [ ] Repository cloned on VPS
- [ ] `.env.production` configured with secure passwords
- [ ] Traefik email updated
- [ ] Traefik dashboard password generated
- [ ] Firewall configured (UFW)
- [ ] Deployment script executed successfully
- [ ] All containers running
- [ ] Frontend accessible
- [ ] Backend API accessible
- [ ] phpMyAdmin accessible
- [ ] Default admin password changed
- [ ] Backup script configured

---

## 🎉 Success!

Your ShiftTrackPro application is now live on HostKey VPS with:

✅ **Automatic SSL** via Let's Encrypt
✅ **Cloudflare CDN** for frontend
✅ **Docker containerization** for easy management
✅ **Automatic restarts** on server reboot
✅ **phpMyAdmin** for database management
✅ **Production-ready** security settings

**Your live URLs**:
- 🌐 https://shifttrackpro.mk-codes.com
- 🔧 https://api.mk-codes.com
- 📚 https://api.mk-codes.com/api/docs
- 🗄️ https://phpmyadmin.shifttrackpro.mk-codes.com

**Enjoy your production app! 🚀**
