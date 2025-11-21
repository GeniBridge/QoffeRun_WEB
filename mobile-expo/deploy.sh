#!/bin/bash

# Deployment script for QoffeRun Mobile to qofferun.com/mobile/

set -e

echo "🚀 Deploying QoffeRun Mobile..."

# Build first
echo "📦 Building application..."
cd /srv/qofferun/mobile-expo
./build.sh

# Restart the portal frontend container to pick up new files
echo "🔄 Restarting portal frontend container..."
cd /srv/qofferun
docker compose restart portal_frontend

echo "✅ Deployment complete!"
echo ""
echo "🌐 App is now live at: https://qofferun.com/mobile/"
echo ""
echo "To verify deployment:"
echo "  curl -I https://qofferun.com/mobile/"

