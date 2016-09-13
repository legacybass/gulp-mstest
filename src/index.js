import gutil from 'gulp-util';
import through from 'through2';
import MSTest from 'mstest';

export default function RunTests(opts = {}) {
	var msTest = new MSTest();
	msTest.details.errorMessage = true;
	msTest.details.errorStackTrace = true;
	msTest.language = opts.language;

	if(opts.workingDir && !opts.workingDir === '!source')
		msTest.workingDir = opts.workingDir;
	
	msTest.noIsolation = opts.noIsolation;
	msTest.testSettings = opts.testSettings;
	msTest.runConfig = opts.runConfig;
	msTest.resultsFile = opts.resultsFile;
	msTest.debugLog = opts.debugLog;
	msTest.useStdErr = opts.useStdErr;

	return through.obj(function (file, enc, cb) {
		if(file.isNull())
			return cb(null, file);
		
		if(file.isStream())
			return cb(new gutil.PluginError('gulp-mstest', 'Streaming not supported'));
		
		gutil.log(gutil.colors.italic(gutil.colors.bold(`Running tests in ${file.path}`)));
		
		try {
			msTest.testContainer = file.path;
			if(opts.workingDir === '!source') {
				let index = file.path.lastIndexOf('/');
				if(index === -1)
					index = file.path.lastIndexOf('\\');

				let dir = file.path.substr(0, index);
				if(dir.length === 0)
					dir = '.';
				
				msTest.workingDir = dir;
				gutil.log(gutil.colors.italic(gutil.colors.bold(`Setting working directory to "${dir}".`)));
			}

			msTest.runTests({
				eachTest: test => {
					if(opts.outputEachResult) {
						if(test.passed) {
							gutil.log(gutil.colors.bgGreen(`${test.status} - ${test.name}`));
						}
						else {
							gutil.log(gutil.colors.bgRed(`${test.status} - ${test.name}`));
							if(opts.errorMessage)
								gutil.log(gutil.colors.bgRed(test.errorMessage));
							if(opts.errorStackTrace)
								gutil.log(gutil.colors.bgRed(test.errorStackTrace));
						}
					}
				},
				done: (results, passed, failed) => {
					if(opts.outputFinalCount) {
						gutil.log(gutil.colors.underline(`Passed ${gutil.colors.green(passed.length)}/${gutil.colors.blue(results.length)} tests.`));
					}
					
					var error = null;
					
					if(opts.quitOnFailed && failed.length > 0) {
						var errorMessage = gutil.colors.red('Tests failed');
						if(opts.errorMessage || opts.errorStackTrace) {
							errorMessage += ':\n\t';
							errorMessage += failed.map(function (test) {
								var msg = gutil.colors.underline(gutil.colors.bold(gutil.colors.yellow(test.name)));
								if(opts.errorMessage)
									msg += `\n\t\tError Message: ${gutil.colors.yellow(test.errorMessage)}`;
								if(opts.errorStackTrace)
									msg += `\n\t\tStack Trace: ${gutil.colors.magenta(test.errorStackTrace)}`;
								return msg;
							}).join('\n\t');
						}
						error = new gutil.PluginError('gulp-mstest', errorMessage);
					}
					
					cb(error, {
						results: results,
						passed: passed,
						failed: failed
					});
				}
			});
		}
		catch (err) {
			this.emit('error', new gutil.PluginError('gulp-mstest', err, {
				fileName: file.path,
				showProperties: false
			}));
		}
	});
}