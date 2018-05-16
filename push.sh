#!/bin/bash

VERSION="$(head -1 VERSION)"

docker push "eu.gcr.io/jeffrey-197808/api:$VERSION"
