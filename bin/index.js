'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = RunTests;

var _gulpUtil = require('gulp-util');

var _gulpUtil2 = _interopRequireDefault(_gulpUtil);

var _through = require('through2');

var _through2 = _interopRequireDefault(_through);

var _mstest = require('mstest');

var _mstest2 = _interopRequireDefault(_mstest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function RunTests() {
	var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	var msTest = new _mstest2.default();
	msTest.details.errorMessage = true;
	msTest.details.errorStackTrace = true;
	msTest.language = opts.language;

	if (opts.workingDir && !opts.workingDir === '!source') msTest.workingDir = opts.workingDir;

	msTest.noIsolation = opts.noIsolation;
	msTest.testSettings = opts.testSettings;
	msTest.runConfig = opts.runConfig;
	msTest.resultsFile = opts.resultsFile;
	msTest.debugLog = opts.debugLog;
	msTest.useStdErr = opts.useStdErr;

	return _through2.default.obj(function (file, enc, cb) {
		if (file.isNull()) return cb(null, file);

		if (file.isStream()) return cb(new _gulpUtil2.default.PluginError('gulp-mstest', 'Streaming not supported'));

		_gulpUtil2.default.log(_gulpUtil2.default.colors.italic(_gulpUtil2.default.colors.bold('Running tests in ' + file.path)));

		try {
			msTest.testContainer = file.path;
			if (opts.workingDir === '!source') {
				var index = file.path.lastIndexOf('/');
				if (index === -1) index = file.path.lastIndexOf('\\');

				var dir = file.path.substr(0, index);
				if (dir.length === 0) dir = '.';

				msTest.workingDir = dir;
				_gulpUtil2.default.log(_gulpUtil2.default.colors.italic(_gulpUtil2.default.colors.bold('Setting working directory to "' + dir + '".')));
			}

			msTest.runTests({
				eachTest: function eachTest(test) {
					if (opts.outputEachResult) {
						if (test.passed) {
							_gulpUtil2.default.log(_gulpUtil2.default.colors.bgGreen(test.status + ' - ' + test.name));
						} else {
							_gulpUtil2.default.log(_gulpUtil2.default.colors.bgRed(test.status + ' - ' + test.name));
							if (opts.errorMessage) _gulpUtil2.default.log(_gulpUtil2.default.colors.bgRed(test.errorMessage));
							if (opts.errorStackTrace) _gulpUtil2.default.log(_gulpUtil2.default.colors.bgRed(test.errorStackTrace));
						}
					}
				},
				done: function done(results, passed, failed) {
					if (opts.outputFinalCount) {
						_gulpUtil2.default.log(_gulpUtil2.default.colors.underline('Passed ' + _gulpUtil2.default.colors.green(passed.length) + '/' + _gulpUtil2.default.colors.blue(results.length) + ' tests.'));
					}

					var error = null;

					if (opts.quitOnFailed && failed.length > 0) {
						var errorMessage = _gulpUtil2.default.colors.red('Tests failed');
						if (opts.errorMessage || opts.errorStackTrace) {
							errorMessage += ':\n\t';
							errorMessage += failed.map(function (test) {
								var msg = _gulpUtil2.default.colors.underline(_gulpUtil2.default.colors.bold(_gulpUtil2.default.colors.yellow(test.name)));
								if (opts.errorMessage) msg += '\n\t\tError Message: ' + _gulpUtil2.default.colors.yellow(test.errorMessage);
								if (opts.errorStackTrace) msg += '\n\t\tStack Trace: ' + _gulpUtil2.default.colors.magenta(test.errorStackTrace);
								return msg;
							}).join('\n\t');
						}
						error = new _gulpUtil2.default.PluginError('gulp-mstest', errorMessage);
					}

					cb(error, {
						results: results,
						passed: passed,
						failed: failed
					});
				}
			});
		} catch (err) {
			this.emit('error', new _gulpUtil2.default.PluginError('gulp-mstest', err, {
				fileName: file.path,
				showProperties: false
			}));
		}
	});
}