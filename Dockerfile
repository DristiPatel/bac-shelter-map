FROM node:lts-bookworm-slim

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install dependencies before copying the rest of the code
RUN npm install

# Copy the remaining source code
COPY . .

# Corrected command to run your script
CMD ["npm", "run", "dockercmd"]
