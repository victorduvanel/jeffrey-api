FROM node:8.9.1
MAINTAINER William Riancho <william@reptilians.io>

WORKDIR /app
ADD package.json ./
RUN npm install

ADD . .
RUN npm run build

EXPOSE 3000
CMD npm run migrate && npm run serve
