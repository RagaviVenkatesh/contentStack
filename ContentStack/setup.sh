#!/bin/bash

# Locale Variants Manager - Setup Script
# This script sets up the development environment for the Contentstack Marketplace App

echo "🚀 Setting up Locale Variants Manager..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

# Create environment files if they don't exist
if [ ! -f "server/.env" ]; then
    echo "📝 Creating server environment file..."
    cp server/env.example server/.env
    echo "⚠️  Please edit server/.env with your API keys"
fi

if [ ! -f "client/.env" ]; then
    echo "📝 Creating client environment file..."
    cp client/env.example client/.env
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p server/dist
mkdir -p client/dist

# Build TypeScript
echo "🔨 Building TypeScript..."
cd server
npm run build
cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit server/.env with your Contentstack and AI API keys"
echo "2. Run 'npm run dev' to start both frontend and backend"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Required API keys:"
echo "- CONTENTSTACK_API_KEY: Your Contentstack stack API key"
echo "- CONTENTSTACK_MANAGEMENT_TOKEN: Management token with content permissions"
echo "- PERSONALIZE_API_KEY: Personalize API key for variant storage"
echo "- OPENAI_API_KEY: OpenAI API key for translations (optional)"
echo "- GROQ_API_KEY: Groq API key for translations (optional)"
echo ""
echo "Happy coding! 🚀"
