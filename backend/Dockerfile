FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD sh -c "echo 'Waiting for database...' && sleep 20 && node dist/database/seeds/seed.js || echo 'Seed failed or already exists' && echo 'Starting application...' && npm run start:prod"
