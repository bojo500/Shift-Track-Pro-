#!/bin/bash
set -e

echo "📦 Installing dependencies..."
npm ci --only=production

echo "🔨 Building backend..."
npm run build

echo "🌱 Running database migrations..."
npm run typeorm migration:run || echo "⚠️  No migrations to run or migration failed"

echo "🌱 Seeding database..."
npm run seed || echo "⚠️  Seeding failed or already seeded"

echo "✅ Build complete!"
