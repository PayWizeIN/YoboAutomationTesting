#!/bin/bash

# Quick test runner with log output
cd "$(dirname "$0")" || exit

echo "🚀 Starting Payment Service Tests..."
echo "📊 Logs will appear below:\n"

# Run without UI to see logs in terminal
npm run api:dev -- --reporter=verbose
