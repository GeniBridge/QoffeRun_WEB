# 🚀 QoffeRun - Complete Project Setup & Run Guide

![QoffeRun Logo](frontend-portal/public/logo.png)

**QoffeRun** is a comprehensive Point of Sale (POS) system for bars and restaurants, featuring a modern web-based architecture with multiple frontend panels and a robust Laravel backend.

## 📋 Table of Contents
- [🏗️ Architecture Overview](#️-architecture-overview)
- [⚡ Quick Start](#-quick-start)
- [📦 Prerequisites](#-prerequisites)
- [🔧 Installation](#-installation)
- [🚀 Running the Project](#-running-the-project)
- [🌐 Access URLs](#-access-urls)
- [💻 Development Mode](#-development-mode)
- [🗄️ Database Setup](#️-database-setup)
- [🛠️ Troubleshooting](#️-troubleshooting)
- [📚 Project Structure](#-project-structure)

---

## 🏗️ Architecture Overview

### Technology Stack
- **Backend**: Laravel 10 + PHP 8.1 + PostgreSQL 15
- **Frontend**: React 18.3.1 + Vite 5.4 + Tailwind CSS
- **Infrastructure**: Docker + Docker Compose + Traefik + Nginx
- **SSL**: Let's Encrypt (automatic)

### Services Overview
```
┌─────────────────┬──────────────────┬─────────────────────────┐
│ Service         │ Technology       │ Domain                  │
├─────────────────┼──────────────────┼─────────────────────────┤
│ Landing Page    │ React + Vite     │ qofferun.com            │
│ Bar Panel       │ React + Vite     │ bar.qofferun.com        │
│ Admin Panel     │ CoreUI React     │ controllo.qofferun.com  │
│ Backend API     │ Laravel + PHP    │ api.qofferun.com        │
│ Database Admin  │ pgAdmin 4        │ db.qofferun.com         │
└─────────────────┴──────────────────┴─────────────────────────┘
```

---

## ⚡ Quick Start

For experienced developers who want to get started immediately:

```bash
# Clone the repository
git clone https://github.com/GeniBridge/QoffeRun_WEB.git
cd QoffeRun_WEB

# Start all services
docker compose up -d

# Build frontend projects (if needed)
cd frontend-portal && npm install && npm run build && cd ..
cd frontend-bar-panel && npm install && npm run build && cd ..
cd frontend-admin-panel && npm install && npm run build && cd ..

# Access the application
open https://qofferun.com
```

---

## 📦 Prerequisites

### System Requirements
- **Docker** 24.0+ with Docker Compose
- **Node.js** 18+ and **npm** 9+ (for frontend development)
- **Git** for version control
- **Linux/macOS/Windows** with Docker support

### Port Requirements
- **80, 443**: HTTP/HTTPS (Traefik reverse proxy)
- **5432**: PostgreSQL (internal only)
- **5173, 3000**: Development servers (optional)

---

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/GeniBridge/QoffeRun_WEB.git
cd QoffeRun_WEB
```

### 2. Environment Setup
```bash
# Copy environment files (if they exist)
cp backend/src/.env.example backend/src/.env  # Edit with your settings
```

### 3. Install Frontend Dependencies
```bash
# Portal Landing Page
cd frontend-portal
npm install
npm run build
cd ..

# Bar Management Panel
cd frontend-bar-panel
npm install
npm run build
cd ..

# Admin Control Panel
cd frontend-admin-panel
npm install
npm run build
cd ..
```

### 4. Backend Setup
```bash
# Install PHP dependencies (inside Docker container)
docker compose up -d backend
docker exec -it qoffe-run-backend composer install
docker exec -it qoffe-run-backend php artisan key:generate
docker exec -it qoffe-run-backend php artisan migrate
```

---

## 🚀 Running the Project

### Production Mode (Recommended)
```bash
# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### Individual Service Control
```bash
# Start specific services
docker compose up -d traefik db backend backend_web
docker compose up -d portal_frontend bar_frontend controllo_frontend

# Restart a service
docker compose restart portal_frontend

# Stop all services
docker compose down
```

### Build & Deploy Updates
```bash
# After making changes to frontend code
cd frontend-portal && npm run build && cd ..
docker compose restart portal_frontend

# After making changes to backend code
docker compose restart backend backend_web
```

---

## 🌐 Access URLs

Once the project is running, access these URLs:

| Service | URL | Description |
|---------|-----|-------------|
| **Landing Page** | https://qofferun.com | Main website and registration |
| **Bar Panel** | https://bar.qofferun.com | Bar management interface |
| **Admin Panel** | https://controllo.qofferun.com | Administrative control panel |
| **API Backend** | https://api.qofferun.com | Laravel API endpoints |
| **Database Admin** | https://db.qofferun.com | pgAdmin interface |

### Default Credentials
- **pgAdmin**: admin@qofferun.com / change_me_now
- **Database**: qoffeuser / qoffe2025 / qoffe_run

---

## 💻 Development Mode

### Frontend Development with Hot Reload
```bash
# Portal development
cd frontend-portal
npm run dev
# Opens: http://localhost:5173

# Bar Panel development
cd frontend-bar-panel
npm run dev
# Opens: http://localhost:5174

# Admin Panel development
cd frontend-admin-panel
npm start
# Opens: http://localhost:3000
```

### Backend Development
```bash
# Access backend container
docker exec -it qoffe-run-backend bash

# Run Artisan commands
php artisan migrate
php artisan db:seed
php artisan tinker

# View logs
tail -f storage/logs/laravel.log
```

### Database Access
```bash
# Direct PostgreSQL access
docker exec -it qoffe-run-db psql -U qoffeuser -d qoffe_run

# Via pgAdmin: https://db.qofferun.com
```

---

## 🗄️ Database Setup

### Initialize Database
```bash
# Run migrations
docker exec -it qoffe-run-backend php artisan migrate

# Seed database with demo data
docker exec -it qoffe-run-backend php artisan db:seed

# Reset database (⚠️ destroys data)
docker exec -it qoffe-run-backend php artisan migrate:fresh --seed
```

### Database Backup & Restore
```bash
# Backup database
docker exec qoffe-run-db pg_dump -U qoffeuser qoffe_run > backup_$(date +%Y%m%d).sql

# Restore database
docker exec -i qoffe-run-db psql -U qoffeuser -d qoffe_run < backup_20251102.sql
```

---

## 🛠️ Troubleshooting

### Common Issues

#### 1. **Containers Not Starting**
```bash
# Check Docker status
docker compose ps
docker compose logs [service-name]

# Restart Docker daemon
sudo systemctl restart docker
```

#### 2. **Frontend Build Errors**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 3. **SSL Certificate Issues**
```bash
# Check Traefik logs
docker compose logs traefik

# Verify domain DNS pointing to server IP
nslookup qofferun.com
```

#### 4. **Database Connection Issues**
```bash
# Check database status
docker compose logs db

# Verify credentials in backend/.env
docker exec -it qoffe-run-backend cat .env | grep DB_
```

#### 5. **Permission Issues**
```bash
# Fix Laravel permissions
docker exec -it qoffe-run-backend chown -R www-data:www-data storage bootstrap/cache
docker exec -it qoffe-run-backend chmod -R 775 storage bootstrap/cache
```

### Performance Optimization
```bash
# Clear all caches
docker exec -it qoffe-run-backend php artisan cache:clear
docker exec -it qoffe-run-backend php artisan config:clear
docker exec -it qoffe-run-backend php artisan route:clear

# Optimize for production
docker exec -it qoffe-run-backend php artisan config:cache
docker exec -it qoffe-run-backend php artisan route:cache
```

### Logs & Debugging
```bash
# View all service logs
docker compose logs -f

# Specific service logs
docker compose logs -f backend
docker compose logs -f traefik
docker compose logs -f portal_frontend

# Laravel logs
docker exec -it qoffe-run-backend tail -f storage/logs/laravel.log
```

---

## 📚 Project Structure

```
QoffeRun_WEB/
├── 📁 backend/                     # Laravel API Backend
│   ├── 📁 src/                     # Laravel application code
│   ├── 📁 docker/                  # Backend Docker configuration
│   └── 📄 nginx-backend.conf       # Nginx configuration for API
│
├── 📁 frontend-portal/             # Landing Page (React + Vite)
│   ├── 📁 src/                     # React source code
│   ├── 📁 public/                  # Static assets
│   └── 📁 build/                   # Production build output
│
├── 📁 frontend-bar-panel/          # Bar Management Panel
│   ├── 📁 src/                     # React source code
│   └── 📁 build/                   # Production build output
│
├── 📁 frontend-admin-panel/        # Admin Control Panel (CoreUI)
│   ├── 📁 src/                     # React source code
│   └── 📁 build/                   # Production build output
│
├── 📄 docker-compose.yml           # Main orchestration file
├── 📄 nginx-spa.conf               # Nginx config for SPAs
├── 📄 DOCUMENTATION.md             # Detailed system documentation
├── 📄 QUICK_COMMANDS.md            # Quick reference commands
└── 📄 README.md                    # This file
```

### Frontend Projects Details

#### 🏠 Portal Landing Page
- **Tech**: React 18.3.1 + Vite + Tailwind CSS
- **Features**: Multi-step registration, contact forms, responsive design
- **Build**: `npm run build` → `build/` folder

#### 🏪 Bar Management Panel  
- **Tech**: React 18.3.1 + Vite + Custom CSS
- **Features**: Menu management, QR codes, order processing
- **Build**: `npm run build` → `build/` folder

#### 🛠️ Admin Control Panel
- **Tech**: CoreUI React 5.5.0 + Bootstrap
- **Features**: User management, analytics, system administration
- **Build**: `npm run build` → `build/` folder

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature-name`
3. **Commit** your changes: `git commit -m "Add feature"`
4. **Push** to the branch: `git push origin feature-name`
5. **Submit** a pull request

## 📞 Support

- **Documentation**: See `DOCUMENTATION.md` for detailed system info
- **Quick Commands**: See `QUICK_COMMANDS.md` for common operations
- **Issues**: Create GitHub issues for bugs and feature requests

---

**QoffeRun Team** © 2025 | **Server**: Production Ready | **Status**: ✅ Active Development