#!/bin/sh

set -e

PROJECT_ID="8cb44c01306e202c5bc9883b9cafe0a3"
ACCESS_TOKEN="ad097be8671b9f46d1d0cd9f3e0c2541738827d0d138ed8275ce53e6677575e0"

for locale in 'fr-FR' 'fr-CH' 'en-US' 'en-GB' 'ja-JP' 'ko-KR'
do
  curl "https://api.phraseapp.com/api/v2/projects/$PROJECT_ID/locales/$locale/download?file_format=simple_json&tag=api" \
       -H "Authorization: token $ACCESS_TOKEN" \
       -o "$locale.json"
done
