#!/bin/bash

# HomeCare Netlify Deployment Script
echo "🚀 Starting HomeCare deployment to Netlify..."

# Build the project
echo "📦 Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully"
else
    echo "❌ Build failed"
    exit 1
fi

# Check if _redirects file exists in dist
if [ -f "dist/_redirects" ]; then
    echo "✅ _redirects file found in dist folder"
else
    echo "❌ _redirects file missing from dist folder"
    exit 1
fi

# Check if netlify.toml exists
if [ -f "netlify.toml" ]; then
    echo "✅ netlify.toml configuration found"
else
    echo "❌ netlify.toml file missing"
    exit 1
fi

echo ""
echo "🎯 Deployment files are ready!"
echo ""
echo "📋 Next steps:"
echo "1. Commit and push to Git (if using auto-deploy):"
echo "   git add ."
echo "   git commit -m 'Fix Netlify SPA routing with redirects'"
echo "   git push origin main"
echo ""
echo "2. Or deploy manually to Netlify:"
echo "   - Go to your Netlify dashboard"
echo "   - Drag and drop the 'dist' folder"
echo "   - Or use: netlify deploy --prod --dir=dist"
echo ""
echo "🔗 After deployment, test these URLs:"
echo "   - https://homecare247.netlify.app/admin/customers"
echo "   - https://homecare247.netlify.app/admin/caregivers"
echo "   - https://homecare247.netlify.app/packages"
echo ""
echo "✅ The SPA routing issue will be resolved!" 