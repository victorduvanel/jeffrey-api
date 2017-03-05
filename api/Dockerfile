FROM node:7.1.0
MAINTAINER William Riancho <william@reptilians.io>

RUN curl -o- -L https://yarnpkg.com/install.sh | bash

WORKDIR /app
ADD package.json yarn.lock ./
RUN $HOME/.yarn/bin/yarn --pure-lockfile

ADD . .
RUN npm run build

EXPOSE 3000
CMD npm run migrate && npm run serve
