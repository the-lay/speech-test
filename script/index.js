// Requires
var google = require('google-speech-api'),
	yandex = require('yandex-speech'),
	request = require('superagent'), //for piping
	concat = require('concat-stream'), //for concating the piping
	xml2js = require('xml2js'), //for parsing xml to json
	fs = require('fs'), //for working with filesystem
	Q = require('q'); //for easier async stuff

// Portable shell commands
require('shelljs/global');

// Configurations
var googleOpts = {
	key: 'AIzaSyAYZia0mJEtWyjo4k44IvvVLU0fDG-Pwu0',
	lang: 'ru-RU',
	filetype: 'mp3'
};
var yandexOpts = {
	developer_key: '2671b91d-0306-4eab-a508-ef86a2de2939',
	lang: 'ru-RU',
};
var generalOpts = {
	googleHyp: './results/hyp_google.txt',
	yandexHyp: './results/hyp_yandex.txt'
}

// Helpers
var getGoogleTranscript = function(file, callback) {
	var opts = JSON.parse(JSON.stringify(googleOpts)), //copy of googleOpts without reference
		finalTranscript;
	opts.file = file;

	var stream = google(opts, function(err, results) {
		if (err) throw err;
		// Piping and concatenating all results
		stream.pipe(concat(function(data) {
			// such comfort, much nesting
			finalTranscript = results[0].result[0].alternative[results[0].result_index].transcript + ' (' + file + ')';
			callback(finalTranscript);
		}));
	});
};
var getYandexTranscript = function(file, callback) {
	var opts = JSON.parse(JSON.stringify(yandexOpts)), //copy of yandexOpts without reference
		finalTranscript;
	opts.file = file;

	yandex.ASR(opts, function(err, httpResponse, xml) {
		if (err) throw err;

		// Parsing xml to JSON
		xml2js.parseString(xml, function(xmlErr, results) {
			if (xmlErr) throw xmlErr;

			// Find the final transcript (has confidence not zero)
			results.recognitionResults.variant.some(function(transcript) {
				if (transcript['$'].confidence !== '0') {
					finalTranscript = transcript['_'] + ' (' + file + ')';
					callback(finalTranscript);
				}
			});
		});
	});
};

// Clean hypothesis files
fs.writeFileSync(generalOpts.googleHyp, '');
fs.writeFileSync(generalOpts.yandexHyp, '');

// Read audio directory
fs.readdir('./audio', function(err, files) {
	if (err) throw err;

	var processFiles = function() {
		var promises = [];

		// Get transcripts of every .mp3 files in folder
		console.log('Starting transcripting.');
		files.forEach(function(file) {
			if (file.substr(file.length-4) === '.mp3') { 
				var yDeferred = Q.defer(),
					gDeferred = Q.defer();

				getYandexTranscript('./audio/'+file, function(result) {
					// Appending results transcript to hyp_yandex.txt
					fs.appendFile(generalOpts.yandexHyp, result+'\n', function(fsErr) {
						yDeferred.resolve();
					});
				});

				getGoogleTranscript('./audio/'+file, function(result) {
					// Appending results transcript to hyp_google.txt
					fs.appendFile(generalOpts.googleHyp, result+'\n', function(fsErr) {
						gDeferred.resolve();
					});
				});

				promises.push(yDeferred.promise);
				promises.push(gDeferred.promise);
			}
		});
		return Q.all(promises);
	}

	// When all transcripts are done, run wer testing utility
	processFiles().then(function() {
		var gDeferred = Q.defer(),
			yDeferred = Q.defer();

		console.log('Transcripting done.\nRunning word_align.pl script on results...');

		if (exec('./word_align.pl audio/reference.txt results/hyp_yandex.txt > results/yandex_results.txt').code !== 0) {
			console.log('Analysis of Yandex results failed... ');
			yDeferred.reject();
		} else {
			console.log('Analysis of Yandex results successful!');
			yDeferred.resolve();
		}

		if (exec('./word_align.pl audio/reference.txt results/hyp_google.txt > results/google_results.txt').code !== 0) {
			console.log('Analysis of Google results failed... ');
			gDeferred.reject();
		} else {
			console.log('Analysis of Google results successful!');
			gDeferred.resolve();
		}

		return Q.all([gDeferred.promise, yDeferred.promise]);

	}).catch(function(error) {
		console.log(error);
	}).done(function() {
		// Show results of word_align.pl in terminal

		fs.readFile('./results/yandex_results.txt', 'utf8', function(err, data) {
			if (err) throw err;
			console.log('\x1b[31m', '\nFinal Yandex results', '\x1b[0m');
			console.log(data.substr(data.indexOf('TOTAL')));
		});

		fs.readFile('./results/google_results.txt', 'utf8', function(err, data) {
			if (err) throw err;
			console.log('\x1b[31m', '\nFinal Google results', '\x1b[0m');
			console.log(data.substr(data.indexOf('TOTAL')));
		});
	});
});
