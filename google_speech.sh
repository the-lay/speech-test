#!/bin/bash
# This script goes through every .flac file in audio folder, 
# sends them to Google Speech Recognition service and records the results.

KEY=AIzaSyAYZia0mJEtWyjo4k44IvvVLU0fDG-Pwu0
TIMESTAMP=$(date +%Y-%m-%d-%T)
mkdir -p "results/${TIMESTAMP}"
FOLDER="results/${TIMESTAMP}"

for filename in audio/*.flac; do
    echo -n 'Sending '"$filename"' for recognition... '
    curl -X POST -H "Content-Type: audio/x-flac; rate=44100;" \
        --data-binary @"$filename" --silent \
        'https://www.google.com/speech-api/v2/recognize?output=json&lang=ru-ru&key='"$KEY"'' >> $FOLDER/google_results.txt
    echo ' OK'
done
echo 'Results recorded in '"$FOLDER/google_results.txt"''
