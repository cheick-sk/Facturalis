# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application's source code
COPY . .

# Bundle app source
RUN npm run build

# Expose the port the app runs on
EXPOSE 3001
# Note: The docker-compose.yml for backend does not expose a port directly,
# as it's meant to be accessed via the api-gateway.
# Port 3001 is a common default for NestJS if not configured otherwise.

# Define the command to run the app
CMD ["node", "dist/main"]
