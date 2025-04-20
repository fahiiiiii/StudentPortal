FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Note: We're not adding CMD ["node", "server.js"] as per your instructions
# You'll run the application manually with: node server.js