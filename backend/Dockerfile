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

# Create startup script that syncs DB and seeds data
RUN echo '#!/bin/sh\n\
echo "Waiting for database..."\n\
sleep 10\n\
echo "Initializing database schema and seeding data..."\n\
node -e "const dataSource = require(\"./dist/config/typeorm.config\").default; dataSource.initialize().then(async () => { console.log(\"Database schema synced\"); await dataSource.destroy(); }).catch(err => console.error(err));" || echo "Schema sync skipped"\n\
sleep 2\n\
npm run seed || echo "Seed failed or already exists"\n\
echo "Starting application..."\n\
npm run start:prod\n\
' > /app/start.sh && chmod +x /app/start.sh

# Start the application
CMD ["/app/start.sh"]
