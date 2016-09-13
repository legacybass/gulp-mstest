gulp-mstest
==========
Gulp wrapper for running MSTest

Usage
---------
Use gulp-mstest like any other gulp plugin:

ES5
``` javascript
var gulp = require('gulp'),
	mstest = require('gulp-mstest').default;

gulp.task('mstest', function () {
  return gulp.src(['mytestlibrary.dll'])
  .pipe(mstest());
});
```

ES2015
``` javascript
import gulp from 'gulp';
import mstest from 'gulp-mstest';

gulp.task('mstest', () => gulp.src(['mstestlibrary.dll'])
						  .pipe(mstest()));
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
- language: if you mstest.exe is non-english, change your language (ie. language='fr'). see mstest to see available language.

In addition to the above settings, all settings available to the mstest npm package will be passed through to the mstest library.

One change will allow you to use a special key `"!source"` to indicate to the library that the working directory should be set to the same directory as the test library.
This will default to `"."` if no directory is passed in as a part of the test file path. For example, the path `"D:\code\tests\bin\Debug\mylibrary.tests.dll"` will set the
working directory to `"D:\code\tests\bin\Debug"`. The path of just `"mylibrary.tests.dll"` will set the working directory to `"."`. 