FROM node:10.9.0
MAINTAINER William Riancho <william@reptilians.io>

RUN apt-get update
RUN apt-get install -y xfonts-base xfonts-utils xfonts-75dpi
# RUN curl -OL https://downloads.wkhtmltopdf.org/0.12/0.12.5/wkhtmltox_0.12.5-1.jessie_amd64.deb
RUN curl -OL https://storage.googleapis.com/eu-jffr/static/wkhtmltox_0.12.5-1.jessie_amd64.deb
RUN dpkg -i wkhtmltox_0.12.5-1.jessie_amd64.deb
RUN rm wkhtmltox_0.12.5-1.jessie_amd64.deb

WORKDIR /app
ADD package.json package-lock.json ./
RUN npm install -g npm@6.4.1
RUN npm install

ADD . .
RUN npm run build

ENV PORT 80
EXPOSE 80
CMD npm run migrate && npm run serve
