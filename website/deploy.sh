#!/bin/sh

scp -r ./dist/assets william@prestine.io:/home/william/app/prestine/static
scp ./dist/index.html william@prestine.io:/home/william/app/prestine/app/public
