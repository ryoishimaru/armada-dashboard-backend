# Use the official Node.js 18 image as base
FROM node:18

# Set the working directory in the container
WORKDIR /usr

# Copy the package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application files to the container
COPY . .

# Expose the port the app runs
EXPOSE 5500

# Run the application
CMD ["npm", "start"]
