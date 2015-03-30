#!/bin/bash
# This script goes through every .mp3 file in audio folder, 
# sends them to Yandex Speech Cloud service and records the results.

# Part of POST request is UUID. On my linux machine I can generate it
# with built-in "dbus-uuidgen".
# Your mileage may vary, you may need to change this part if your machine
# does not have it.

KEY=2671b91d-0306-4eab-a508-ef86a2de2939
LANG=ru-RU
TIMESTAMP=$(date +%Y-%m-%d-%T)
mkdir -p "results/${TIMESTAMP}"
FOLDER="results/${TIMESTAMP}"

for filename in audio/*.mp3; do
    echo -n 'Sending '"$filename"' for recognition... '
    UUID=$(dbus-uuidgen)

    curl -4 -F 'Content-Type=audio/x-mpeg-3' \
    	-F 'audio=@'"$filename"'' --silent \
    	'asr.yandex.net/asr_xml?key='"$KEY"'&uuid='"$UUID"'&topic=notes&lang='"$LANG"'' >> $FOLDER/yandex_results.txt

	echo ' OK'
done
echo 'Results recorded in '"$FOLDER/yandex_results.txt"''