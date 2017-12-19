FROM node:9.3.0
MAINTAINER William Riancho <william@reptilians.io>

WORKDIR /app
ADD package.json package-lock.json ./
RUN npm install

ADD . .
RUN npm run build

EXPOSE 3000
CMD npm run migrate && npm run serve
