## Build Stage
FROM node:16.9.1-alpine
WORKDIR /usr
COPY / ./
RUN ls -a
RUN npm install
RUN npm run build

## Run stage
FROM node:16.9.1-alpine
WORKDIR /usr
COPY package.json ./
RUN npm install --only=production
COPY --from=0 /usr/dist/ .
EXPOSE 3000
CMD ["node","app.js"]