#!/bin/sh

set -e

dropdb --if-exists jeffrey
createdb jeffrey
npm run migrate
npm run seed
npm run seed -- --dev
