FROM node:14-alpine

# RUN apk update 
RUN npm i -g lerna 
RUN npm i -g rollup 
WORKDIR /usr/src/app

COPY package*.json ./
ADD lerna.json ./

COPY workspaces/commons/package*.json ./workspaces/commons/
ADD workspaces/commons/src ./workspaces/commons/src
ADD workspaces/commons/@types ./workspaces/commons/@types
ADD workspaces/commons/rollup.config.js ./workspaces/commons/
ADD workspaces/commons/tsconfig.json ./workspaces/commons/

COPY workspaces/server/package*.json ./workspaces/server/
COPY workspaces/server/tsconfig.json ./workspaces/server/
ADD workspaces/server/src ./workspaces/server/src

RUN lerna bootstrap
RUN lerna run build 
# If you are building your code for production
# RUN npm ci --only=production

ENTRYPOINT ["node"]
CMD ["./workspaces/server/dist/extraction-rest-portal/rest-server.js"]