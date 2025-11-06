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
CMD sh -c "echo 'Waiting for database...' && sleep 10 && echo 'Initializing database schema and seeding data...' && node -e \"const dataSource = require('./dist/config/typeorm.config').default; dataSource.initialize().then(async () => { console.log('Database schema synced'); await dataSource.destroy(); }).catch(err => console.error(err));\" || echo 'Schema sync skipped' && sleep 2 && npm run seed || echo 'Seed failed or already exists' && echo 'Starting application...' && npm run start:prod"
