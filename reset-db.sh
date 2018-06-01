#!/bin/sh

set -e

dropdb jeffrey
createdb jeffrey
npm run migrate
npm run seed
npm run seed -- --dev
