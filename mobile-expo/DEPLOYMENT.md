# QoffeRun Mobile - Deployment Guide

## 🎯 Overview

The mobile app is deployed as a subdirectory at **https://qofferun.com/mobile/**

## 📋 Prerequisites

- Docker and Docker Compose installed
- Access to `/srv/qofferun/` directory
- Portal frontend container running

## 🚀 Quick Deployment

```bash
cd /srv/qofferun/mobile-expo
./deploy.sh
```

This script will:
1. Install dependencies (if needed)
2. Build the web bundle
3. Fix asset paths for subdirectory deployment
4. Restart the portal frontend container

## 🔧 Manual Deployment Steps

### 1. Build the Application

```bash
cd /srv/qofferun/mobile-expo
npm install
npm run build:web
./fix-paths.sh
```

### 2. Restart Container

```bash
cd /srv/qofferun
docker compose restart portal_frontend
```

### 3. Verify Deployment

```bash
curl -I https://qofferun.com/mobile/
```

Expected response: `HTTP/2 200`

## 📁 File Structure

```
/srv/qofferun/
├── mobile-expo/
│   ├── build/              # Built web files (served at /mobile/)
│   ├── src/                # Source code
│   ├── build.sh            # Build script
│   ├── deploy.sh           # Deployment script
│   └── fix-paths.sh        # Post-build path fixer
├── nginx-spa.conf          # Nginx config (includes /mobile/ location)
└── docker-compose.yml      # Docker services (portal_frontend mounts build/)
```

## 🔄 Continuous Deployment

To automate deployment after code changes:

```bash
cd /srv/qofferun/mobile-expo
git pull  # if using git
./deploy.sh
```

## 🌐 Access Points

- **Production**: https://qofferun.com/mobile/
- **API Backend**: https://qofferun.com/api/v1
- **Admin Portal**: https://qofferun.com/

## 🐛 Troubleshooting

### Mobile app returns 404

Check if the build directory is mounted:
```bash
docker exec portal-frontend ls /srv/qofferun/mobile-expo/build/
```

### Assets not loading

Verify paths were fixed:
```bash
grep "script src" /srv/qofferun/mobile-expo/build/index.html
# Should show: src="/mobile/_expo/..."
```

### Container not starting

Check docker-compose.yml has the volume mount:
```bash
grep -A 5 "portal_frontend:" /srv/qofferun/docker-compose.yml
```

### API calls failing

Check the API base URL in `.env`:
```bash
cat /srv/qofferun/mobile-expo/.env
# Should have: EXPO_PUBLIC_API_BASE=https://qofferun.com/api/v1
```

## 🔐 Environment Variables

Create `/srv/qofferun/mobile-expo/.env`:

```env
EXPO_PUBLIC_API_BASE=https://qofferun.com/api/v1
```

## 📦 Dependencies

The app requires these web-specific dependencies:
- `react-dom`
- `react-native-web`
- `@expo/metro-runtime`
- `expo-asset`
- `expo-font`

These are automatically installed when running `./build.sh`

## 🔄 Updating the App

1. Make your code changes in `src/`
2. Test locally: `npm start` then press `w` for web
3. Deploy: `./deploy.sh`

## ✅ Post-Deployment Checklist

- [ ] Mobile app loads at https://qofferun.com/mobile/
- [ ] Navigation works (login, branch list, etc.)
- [ ] API calls succeed (check browser network tab)
- [ ] Assets load correctly (images, fonts)
- [ ] No console errors in browser developer tools
