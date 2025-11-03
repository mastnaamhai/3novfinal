#!/bin/bash

# Production Build Script for TranspoTruck
echo "🚀 Starting production build..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist
rm -rf backend/dist

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd backend && npm install && cd ..

# Build backend
echo "🔨 Building backend..."
cd backend
npm run build
cd ..

# Build frontend
echo "🔨 Building frontend..."
npm run build

echo "✅ Build completed successfully!"
echo "📁 Frontend build: ./dist"
echo "📁 Backend build: ./backend/dist"
echo ""
echo "🚀 Ready for deployment!"
echo "   Frontend: Deploy ./dist to Netlify"
echo "   Backend: Deploy ./backend to Render"
