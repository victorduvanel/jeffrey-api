#!/bin/sh

rm -rf ./dist
ember build --prod
find . -name .DS_Store -exec rm -f {} \;
scp -r ./dist/assets william@prestine.io:/home/william/app/prestine/static
scp ./dist/index.html william@prestine.io:/home/william/app/prestine/app/public
