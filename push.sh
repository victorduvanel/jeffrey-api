#!/bin/bash

VERSION="$(head -1 VERSION)"

docker push "registry.gitlab.com/jeffrey-services/api:$VERSION"
