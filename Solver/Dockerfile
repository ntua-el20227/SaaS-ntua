# Use the official Node.js image as the base image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Install Python and pip
RUN apt-get update && apt-get install -y python3.11 python3-pip python3-venv

COPY requirements.txt .

# Create a virtual environment for Python
RUN python3 -m venv /app/venv



# Activate the virtual environment and install Python dependencies
RUN /app/venv/bin/pip install --upgrade pip
RUN /app/venv/bin/pip install -r requirements.txt

ENV PATH="/app/venv/bin:$PATH"

ENV NODE_ENV=container

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 4001

# Command to run the Node.js application
CMD ["node", "server.js"]


