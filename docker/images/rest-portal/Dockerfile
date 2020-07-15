FROM node:14.5-slim

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
ADD dist dist 

EXPOSE 3100

# run command
CMD ["node", "./dist/extraction-rest-portal/rest-server.js"]