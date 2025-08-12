# Use an official Node runtime as the base image
FROM node:16

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install global dependencies
RUN npm install -g concurrently

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Install frontend dependencies
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Copy the rest of the application code
COPY . .

# Build frontend
RUN cd frontend && npm run build

# Expose the port the app runs on
EXPOSE 5000

# Define the command to run the application
CMD ["npm", "run", "heroku-postbuild"]
