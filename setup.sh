#!/bin/bash

# YoboAutomationTesting Quick Start Script
# This script sets up the framework and runs initial tests

set -e

echo "🚀 YoboAutomationTesting Framework Setup"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install Playwright browsers
echo "🎭 Installing Playwright browsers..."
npm run install-browsers

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env with your configuration:"
    echo "   - API Base URLs"
    echo "   - Test Credentials"
    echo "   - API Tokens"
fi

echo ""
echo "✅ Setup Complete!"
echo ""
echo "🎯 Next Steps:"
echo "   1. Edit .env file with your configuration"
echo "   2. Run tests with: npm run test:dev"
echo "   3. View report with: npm run report"
echo ""
echo "📚 Available Commands:"
echo "   API Tests:"
echo "     npm run api:dev        - Run API tests (dev)"
echo "     npm run api:staging    - Run API tests (staging)"
echo ""
echo "   E2E Tests:"
echo "     npm run e2e:dev        - Run E2E tests (dev)"
echo "     npm run e2e:staging    - Run E2E tests (staging)"
echo ""
echo "   All Tests:"
echo "     npm run test:dev       - Run all tests (dev)"
echo "     npm run test:ui        - Interactive mode"
echo "     npm run test:debug     - Debug mode"
echo ""
echo "📊 Reports:"
echo "     npm run report         - View HTML report"
echo ""
echo "📖 Documentation:"
echo "   - README.md            - Full documentation"
echo "   - CLAUDE.md            - AI assistant guide"
echo "   - IMPLEMENTATION_SUMMARY.md - Project overview"
echo ""
echo "🎉 Happy Testing!"
