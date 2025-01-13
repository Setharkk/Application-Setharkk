FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Build if needed
RUN npm run build

# Expose port
EXPOSE 3000

# Start the service
CMD ["npm", "start"] 