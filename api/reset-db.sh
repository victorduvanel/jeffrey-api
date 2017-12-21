#!/bin/sh

set -e

dropdb prestine
createdb prestine
npm run migrate
npm run seed
