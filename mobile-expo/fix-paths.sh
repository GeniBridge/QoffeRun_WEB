#!/bin/bash

# Post-build script to fix asset paths for subdirectory deployment

BUILD_DIR="./build"
BASE_PATH="/mobile"

echo "🔧 Fixing asset paths for $BASE_PATH deployment..."

# Fix paths in index.html
if [ -f "$BUILD_DIR/index.html" ]; then
    echo "  → Updating index.html..."
    sed -i "s|src=\"/_expo/|src=\"$BASE_PATH/_expo/|g" "$BUILD_DIR/index.html"
    sed -i "s|href=\"/_expo/|href=\"$BASE_PATH/_expo/|g" "$BUILD_DIR/index.html"
    sed -i "s|src=\"/assets/|src=\"$BASE_PATH/assets/|g" "$BUILD_DIR/index.html"
    sed -i "s|href=\"/assets/|href=\"$BASE_PATH/assets/|g" "$BUILD_DIR/index.html"
fi

# Fix paths in JS bundles if they contain hardcoded root paths
find "$BUILD_DIR/_expo" -name "*.js" -type f -exec sed -i "s|\"/_expo/static/|\"$BASE_PATH/_expo/static/|g" {} \;

echo "✅ Asset paths fixed!"
