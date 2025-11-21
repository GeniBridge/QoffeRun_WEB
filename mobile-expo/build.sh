#!/bin/bash

# Build script for deploying mobile app to qofferun.com/mobile/

set -e

echo "🏗️  Building QoffeRun Mobile for Web..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build for web with subdirectory support
echo "🔨 Building web bundle..."
npm run build:web

# Fix paths for subdirectory deployment
echo "🔧 Fixing asset paths..."
chmod +x ./fix-paths.sh
./fix-paths.sh

# Create build directory if it doesn't exist
mkdir -p build

echo "✅ Build complete!"
echo ""
echo "📂 Output directory: ./build"
echo "🌐 Deploy to: https://qofferun.com/mobile/"
echo ""
echo "Next steps:"
echo "1. Copy build/ contents to your web server"
echo "2. Configure nginx with the provided nginx-mobile.conf"
echo "3. Ensure API is accessible at https://qofferun.com/api/v1"
echo ""
echo "Or use the deployment script:"
echo "  ./deploy.sh"
