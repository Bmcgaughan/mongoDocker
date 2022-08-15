FROM node:alpine
WORKDIR /usr/array
COPY package*.json .
RUN npm ci
COPY . .
CMD ["npm", "start"]
