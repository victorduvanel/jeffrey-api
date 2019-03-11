FROM ubuntu:18.04
MAINTAINER William Riancho <william@reptilians.io>

ARG NODE_VERSION=v10.15.3

RUN apt-get update
RUN apt-get install -y curl xz-utils \
  xfonts-base xfonts-utils xfonts-75dpi build-essential \
  libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

RUN curl -OL https://nodejs.org/dist/$NODE_VERSION/node-$NODE_VERSION-linux-x64.tar.xz
RUN tar -xJf node-$NODE_VERSION-linux-x64.tar.xz --strip-components=1 -C /usr/local
RUN rm node-$NODE_VERSION-linux-x64.tar.xz
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update && apt-get install yarn -y

RUN curl -OL https://jffr.ams3.digitaloceanspaces.com/static/wkhtmltox_0.12.5-1.bionic_amd64.deb
RUN dpkg -i wkhtmltox_0.12.5-1.bionic_amd64.deb
RUN rm wkhtmltox_0.12.5-1.bionic_amd64.deb

WORKDIR /app
ADD package.json yarn.lock ./
RUN yarn install

ADD . .
RUN npm run build

ENV PORT 80
EXPOSE 80
CMD npm run migrate && npm run serve
