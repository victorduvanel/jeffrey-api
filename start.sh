#!/bin/sh

export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/key.json"
export GCLOUD_PROJECT="jeffrey-197808"

export ELASTIC_APM_SERVICE_NAME="jeffrey-api"
export ELASTIC_APM_SERVER_URL="http://reptilians.io:8200"

npm run watch serve
