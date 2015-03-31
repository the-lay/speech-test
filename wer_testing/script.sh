#!/bin/bash

./word_align.pl ref.txt hyp_google.txt > google_result.txt
./word_align.pl ref.txt hyp_yandex.txt > yandex_result.txt

