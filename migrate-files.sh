#!/bin/bash

# Script to complete the migration from src/base44 to root
# Run this script from the root of your repository

echo "🚀 Starting migration from src/base44 to root..."

# Check if src/base44 exists
if [ ! -d "src/base44" ]; then
    echo "❌ Directory src/base44 not found!"
    exit 1
fi

# Create temp directory
mkdir -p temp_migration

# Copy all pages
echo "📄 Copying pages..."
cp src/base44/pages/*.jsx src/pages/ 2>/dev/null || echo "Pages already copied or not found"

# Copy components directory
echo "🧩 Copying components..."
if [ -d "src/base44/components" ]; then
    cp -r src/base44/components/* src/components/ 2>/dev/null || mkdir -p src/components
fi

# Copy lib directory
echo "📚 Copying lib..."
if [ -d "src/base44/lib" ]; then
    cp -r src/base44/lib/* src/lib/ 2>/dev/null || mkdir -p src/lib
fi

# Copy hooks directory
echo "🪝 Copying hooks..."
if [ -d "src/base44/hooks" ]; then
    cp -r src/base44/hooks/* src/hooks/ 2>/dev/null || mkdir -p src/hooks
fi

# Copy utils directory
echo "🔧 Copying utils..."
if [ -d "src/base44/utils" ]; then
    cp -r src/base44/utils/* src/utils/ 2>/dev/null || mkdir -p src/utils
fi

# Copy api directory
echo "🌐 Copying api..."
if [ -d "src/base44/api" ]; then
    cp -r src/base44/api/* src/api/ 2>/dev/null || mkdir -p src/api
fi

# Copy eslint config if not exists
if [ -f "src/base44/eslint.config.js" ] && [ ! -f "eslint.config.js" ]; then
    echo "⚙️  Copying eslint config..."
    cp src/base44/eslint.config.js .
fi

# Remove old directory
echo "🗑️  Removing old src/base44 directory..."
rm -rf src/base44

# Remove old files from root that are no longer needed
echo "🧹 Cleaning up..."
rm -rf deepseek_html_*.html deepseek_json_*.json deepseek_text_*.txt 2>/dev/null
rm -f "C209+C208 book.xlsm" 2>/dev/null

echo "✅ Migration complete!"
echo ""
echo "Next steps:"
echo "1. Review the changes: git status"
echo "2. Test locally: npm install && npm run dev"
echo "3. Commit changes: git add . && git commit -m 'Complete migration to root structure'"
echo "4. Push to GitHub: git push origin main"
echo "5. Vercel will automatically deploy your changes!"
