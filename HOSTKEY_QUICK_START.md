# 🚀 ShiftTrackPro - HostKey Quick Start (5 Minutes)

## Prerequisites
- HostKey VPS (2 CPU, 4GB RAM, Ubuntu 22.04)
- Your server IP from HostKey email
- Domain: mk-codes.com in Cloudflare

---

## Step 1: Configure Cloudflare DNS (2 minutes)

Add these A records in Cloudflare DNS:

| Name           | IP              | Proxy    |
|----------------|-----------------|----------|
| shifttrackpro  | YOUR_SERVER_IP  | Proxied  |
| api            | YOUR_SERVER_IP  | DNS Only |
| phpmyadmin     | YOUR_SERVER_IP  | DNS Only |
| traefik        | YOUR_SERVER_IP  | DNS Only |

---

## Step 2: Get Cloudflare API Token (1 minute)

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Create Token → "Edit zone DNS" template
3. Include zone: mk-codes.com
4. Copy the token

---

## Step 3: SSH into VPS and Clone Repo (1 minute)

```bash
ssh root@YOUR_SERVER_IP

cd /root
git clone https://github.com/bojo500/Shift-Track-Pro-.git
cd Shift-Track-Pro-
```

---

## Step 4: Configure Environment (2 minutes)

```bash
cp .env.hostkey .env.production
nano .env.production
```

**Change these values**:
- `MYSQL_ROOT_PASSWORD` → Strong password
- `MYSQL_PASSWORD` → Strong password
- `JWT_SECRET` → Random 32+ character string
- `ACME_EMAIL` → Your email
- `CLOUDFLARE_API_TOKEN` → Token from Step 2

Save: `Ctrl+O`, `Enter`, `Ctrl+X`

---

## Step 5: Update Traefik Email (30 seconds)

```bash
nano traefik/traefik.yml
```

Change email in `certificatesResolvers` section.

Save: `Ctrl+O`, `Enter`, `Ctrl+X`

---

## Step 6: Generate Traefik Password (30 seconds)

```bash
apt-get install -y apache2-utils
echo $(htpasswd -nb admin YOUR_PASSWORD)
```

Copy output and add to `.env.production`:
```bash
nano .env.production
# Update TRAEFIK_AUTH with output (use $$ not $)
```

---

## Step 7: Configure Firewall (30 seconds)

```bash
ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
```

---

## Step 8: Deploy! (10-15 minutes)

```bash
sudo bash deploy-hostkey.sh
```

Wait for completion. Script will:
- Install Docker
- Build images
- Start services
- Setup database
- Show status

---

## Step 9: Test

Visit these URLs:

✅ https://shifttrackpro.mk-codes.com (Frontend)
✅ https://api.mk-codes.com/api/docs (API Docs)
✅ https://phpmyadmin.shifttrackpro.mk-codes.com (Database)

**Login**:
- Email: `admin@shifttrack.com`
- Password: `Admin@123`

⚠️ **Change password immediately!**

---

## Useful Commands

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Stop services
docker-compose -f docker-compose.prod.yml down

# Check status
docker-compose -f docker-compose.prod.yml ps
```

---

## Need Help?

Read the full guide: `HOSTKEY_DEPLOYMENT_GUIDE.md`

---

**🎉 You're done! Your app is live!**
