gulp-mstest
==========
Gulp wrapper for running MSTest

Usage
---------
Use gulp-mstest like any other gulp plugin:
```
var gulp = require('gulp'),
    mstest = require('gulp-mstest');

gulp.task('mstest', function () {
  return gulp.src('mytestlibrary.dll')
  .pipe(mstest());
});
```

###Options
Gulp-Mstest has a few minor settings that determine what gets output to the console. By default, nothing is printed to the console -- you will need to tie in another stream to get output. This is beneficial because it allows you to put the test results wherever you want (e.g. file, console, web service, etc.). However, if you'd like to have output, here are the settings to do so:

 - outputEachResult: This will output the pass or fail status of each test as it is run
	 - Example: 'Passed: MyUnitTest'
 - errorMessage: This will output the full error message generated from mstest as each test is run. outputEachResult must be set to true for these to be output.
 - errorStackTrace: This will output the full stack trace generated from mstest as each test is run. outputEachResult must be set to true for these to be output.
 - outputFinalCount: This will output the total number of tests that passed
	 - Example: 'Passed 3/5'
 - quitOnFailed: This causes gulp-mstest to use a gulp plugin error if any of the tests in a dll failed to pass. This is useful when there are multiple test packages that must run and you want to be notified as soon as one fails.
	 - If errorMessage or errorStackTrace are on, they will be output with the failed message
