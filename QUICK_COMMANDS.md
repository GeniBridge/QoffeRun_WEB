# 🚀 QoffeRun - Quick Commands Reference

## Comandi Docker Essenziali

### Sistema Completo
```bash
# Avvio completo
cd /srv/qofferun && docker compose up -d

# Stop completo
cd /srv/qofferun && docker compose down

# Riavvio completo
cd /srv/qofferun && docker compose restart

# Status containers
docker ps

# Logs sistema completo
docker compose logs -f
```

### Servizi Individuali
```bash
# Riavvio singoli servizi
docker compose restart portal-frontend    # Landing page
docker compose restart backend-web        # API Laravel
docker compose restart bar-frontend       # Panel bar
docker compose restart controllo-frontend # Panel admin
docker compose restart traefik           # Reverse proxy

# Logs servizio specifico
docker compose logs -f portal-frontend
docker compose logs -f backend-web
```

## Build Frontend Projects

### Portal Landing Page
```bash
cd /srv/qofferun/frontend-portal
npm install
npm run build
# Output: ./build/ → Docker mount
```

### Bar Panel
```bash
cd /srv/qofferun/frontend-bar-panel  
npm install
npm run build
# Output: ./build/ → Docker mount
```

### Admin Panel  
```bash
cd /srv/qofferun/frontend-admin-panel
npm install
npm run build
# Output: ./build/ → Docker mount
```

## Backend Laravel Commands

### Accesso Container Backend
```bash
docker exec -it qoffe-run-backend bash
```

### Comandi Artisan (dentro container)
```bash
php artisan migrate
php artisan db:seed
php artisan cache:clear
php artisan config:clear
php artisan route:list
```

### Composer (dentro container)
```bash
composer install
composer update
composer dump-autoload
```

## Database Management

### Accesso diretto PostgreSQL
```bash
docker exec -it qoffe-run-db psql -U qoffeuser -d qoffe_run
```

### Backup Database
```bash
docker exec qoffe-run-db pg_dump -U qoffeuser qoffe_run > backup.sql
```

### Restore Database
```bash
docker exec -i qoffe-run-db psql -U qoffeuser -d qoffe_run < backup.sql
```

## Development Commands

### Frontend Development (con hot reload)
```bash
# Portal
cd /srv/qofferun/frontend-portal && npm run dev

# Bar Panel  
cd /srv/qofferun/frontend-bar-panel && npm run dev

# Admin Panel
cd /srv/qofferun/frontend-admin-panel && npm start
```

### Backend Development
```bash
# Nel container backend
docker exec -it qoffe-run-backend php artisan serve --host=0.0.0.0
```

## Troubleshooting Commands

### Verifica Network
```bash
docker network ls
docker network inspect qofferun_traefik
docker network inspect qofferun_internal  
```

### Debug Container
```bash
# Accesso shell container
docker exec -it portal-frontend sh
docker exec -it backend-web sh  
docker exec -it qoffe-run-backend bash

# Verifica mount volumes
docker inspect portal-frontend | grep Mounts -A 10
```

### SSL/Certificati
```bash
# Verifica certificati Traefik
docker exec traefik ls -la /letsencrypt/

# Logs SSL
docker compose logs traefik | grep -i certificate
```

### Performance Monitoring
```bash
# Utilizzo risorse
docker stats

# Spazio disco containers  
docker system df

# Cleanup containers/images inutilizzati
docker system prune
```

## File Locations Quick Reference

### Configurazioni
- Docker Compose: `/srv/qofferun/docker-compose.yml`
- Nginx SPA: `/srv/qofferun/nginx-spa.conf`  
- Nginx Backend: `/srv/qofferun/backend/nginx-backend.conf`

### Source Code  
- Portal: `/srv/qofferun/frontend-portal/src/`
- Bar Panel: `/srv/qofferun/frontend-bar-panel/src/`
- Admin Panel: `/srv/qofferun/frontend-admin-panel/src/`
- Backend: `/srv/qofferun/backend/src/`

### Build Output
- Portal Build: `/srv/qofferun/frontend-portal/build/`
- Bar Build: `/srv/qofferun/frontend-bar-panel/build/`  
- Admin Build: `/srv/qofferun/frontend-admin-panel/build/`

### Volumes
- Database: Docker volume `pgdata`
- SSL Certs: Docker volume `letsencrypt`
- Logs: `/var/lib/docker/containers/`

## URLs Accesso Diretto

- **Landing**: https://qofferun.com
- **API**: https://api.qofferun.com  
- **Bar Panel**: https://bar.qofferun.com
- **Admin Panel**: https://controllo.qofferun.com
- **Database Manager**: https://db.qofferun.com

---
**Quick Reference v1.0** - 2 Novembre 2025