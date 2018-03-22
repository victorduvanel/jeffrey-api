#!/bin/sh

VERSION="$(head -1 VERSION)"

docker build . -t "eu.gcr.io/jeffrey-197808/api:$VERSION"
