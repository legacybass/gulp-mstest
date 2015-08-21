var gutil = require('gulp-util');
var through = require('through2');
var MSTest = require('mstest');

module.exports = function (opts) {
	opts = opts || {};
	
	return through.obj(function (file, enc, cb) {
		if(file.isNull()) {
			cb(null, file);
			return;
		}
		
		if(file.isStream()) {
			cb(new gutil.PluginError('gulp-mstest', 'Streaming not supported'));
			return;
		}
		
		try {
			var msTest = new MSTest();
			msTest.testContainer = file.path;
			msTest.details.errorMessage = true;
			msTest.details.errorStackTrace = true;
			msTest.runTests({
				eachTest: function (test) {
					if(opts.outputEachResult) {
						if(test.passed) {
							gutil.log(gutil.colors.bgGreen(test.status + ' - ' + test.name));
						}
						else {
							gutil.log(gutil.colors.bgRed(test.status + ' - ' + test.name));
							if(opts.errorMessage)
								gutil.log(gutil.colors.bgRed(test.errorMessage));
							if(opts.errorStackTrace)
								gutil.log(gutil.colors.bgRed(test.errorStackTrace));
						}
					}
				},
				done: function (results, passed, failed) {
					if(opts.outputFinalCount) {
						gutil.log(gutil.colors.underline("Passed " + gutil.colors.green(passed.length) + "/" + gutil.colors.blue(results.length) + " tests."));
					}
					
					var error = null;
					
					if(opts.quitOnFailed && failed.length > 0) {
						var errorMessage = gutil.colors.red("Tests failed");
						if(opts.errorMessage || opts.errorStackTrace) {
							errorMessage += ":\n\t";
							errorMessage += failed.map(function (test) {
								var msg = gutil.colors.underline(gutil.colors.bold(gutil.colors.yellow(test.name)));
								if(opts.errorMessage)
									msg += "\n\t\tError Message: " + gutil.colors.yellow(test.errorMessage);
								if(opts.errorStackTrace)
									msg += "\n\t\tStack Trace: " + gutil.colors.magenta(test.errorStackTrace);
								return msg;
							}).join("\n\t");
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
};