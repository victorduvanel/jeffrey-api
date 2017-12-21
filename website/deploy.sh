#!/bin/sh

set -e

if [ -d ./dist ]; then rm -rf ./dist; fi;

ember build --prod
find . -name .DS_Store -exec rm -f {} \;
rsync -av ./dist/assets william@prestine.io:/home/william/app/prestine/static
rsync -av ./dist/*.html william@prestine.io:/home/william/app/prestine/app/public
