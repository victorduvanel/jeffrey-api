#!/bin/sh

export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/key.json"
export GCLOUD_PROJECT="jeffrey-197808"

npm run watch serve
