FROM node:9.5.0
MAINTAINER William Riancho <william@reptilians.io>

WORKDIR /app
ADD package.json package-lock.json ./
RUN npm install

ADD . .
RUN npm run build

ENV PORT 80
EXPOSE 80
CMD npm run migrate && npm run serve
