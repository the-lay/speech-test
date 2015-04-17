# Google Speech API & Yandex Speech Kit

### Feature comparison

|Feature|Yandex Speech Kit|Google Speech API|
|:-:|:-:|:-:|
|Quotas and pricing|1000req / 5$|50req / day|
|Formats|speex, 16-bit PCM, alaw, wav, mpeg-3|flac, 16-bit PCM|
|Request format|HTTPS POST|HTTPS POST|
|Max. request size|90 seconds or 1MB|~15 seconds or 1MB|
|Response format|XML|JSON|
|Languages|ru-RU, tr-TR|A lot [1]|
|Documentation|Official [2]|Unofficial, reverse-engineered [3]|
|WER, initial tests|18.92% [4] |13.51% [5]|

### Examples

Since both services are accesible via HTTP requests, examples use the most trivial way to do http requests manually with *cURL* utility.

**Yandex:**
```sh
curl -4 -F 'Content-Type=audio/x-mpeg-3' \
    -F 'audio=@'"$FILE"'' \
    'asr.yandex.net/asr_xml?key='"$KEY"'&uuid='"$UUID"'&topic=notes&lang=ru-RU'
```
$KEY - Yandex Speech Kit API key  
$FILE - file to transcribe  
$UUID - unique request UUID

**Google:**
```sh
curl -X POST -H "Content-Type: audio/x-flac; rate=44100;" \
    --data-binary @"$FILE" \
    'https://www.google.com/speech-api/v2/recognize?output=json&lang=ru-ru&key='"$KEY"''
```
$KEY - Yandex Speech Kit API key  
$FILE - file to transcribe 

### My subjective opinion

While by initial tests Google Speech API provides higher accuracy transcript, **I strongly advise against using Google Speech API**, because:
- 50 requests per day is not suitable for production and there are no ways to get additional requests;
- API changes too often (twice in the last year);
- No official documentation, everything is reverse-engineered;
- Since it's an unonfficial use, it may be closed without any notice.

I think that Yandex Speech Kit  is the the best of the two for your project.  
Also, I've found interesting question in the FAQ section of Yandex Speech Kit documentation: 
>>**Возможно ли использовать эту систему для обработки массивов уже записанного звука?**  
Если у вас есть такие задачи, [напишите нам](http://feedback2.yandex.ru/cloud-api/).

Meaning that it is possible to work closely with Yandex to transcribe array of already recorded audio files and this might be of interest to the your project.


[1]:http://stackoverflow.com/questions/14257598/what-are-language-codes-for-voice-recognition-languages-in-chromes-implementati/14302134#14302134
[2]:https://tech.yandex.ru/speechkit/cloud/doc/dg/concepts/speechkit-dg-recogn-docpage/
[3]:https://github.com/gillesdemey/google-speech-v2
[4]:https://github.com/the-lay/speech-test/blob/master/wer_testing/yandex_result.txt
[5]:https://github.com/the-lay/speech-test/blob/master/wer_testing/google_result.txt
