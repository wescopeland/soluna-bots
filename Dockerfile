FROM node:16

# Create app directory
WORKDIR /usr/src/app

COPY package.json package-lock.json ./

# Install deps
RUN npm install

# Bundle app source
COPY . .

# Build
RUN npm run build

# Start
CMD [ "npm", "run", "start" ]