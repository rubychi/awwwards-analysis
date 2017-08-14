var gulp = require('gulp'),
    del = require('del'),
    usemin = require('gulp-usemin'),
    rev = require('gulp-rev'),
    cssnano = require('gulp-cssnano'),
    uglify = require('gulp-uglify');

gulp.task('delDistFolder', function() {
  return del('./docs');
});

gulp.task('useminTrigger', ['delDistFolder'], function() {
  gulp.start('usemin');
});

gulp.task('usemin', ['styles', 'scripts'], function() {
  return gulp.src('./assets/index.html')
    .pipe(usemin({
      css: [rev(), cssnano()],
      js: [rev(), uglify()],
      jsVendor: [rev()],
    }))
    .pipe(gulp.dest('./docs'));
});

gulp.task('copyGeneralFiles', ['usemin'], function() {
  var pathsToCopy = [
    './temp/data/*',
  ];
  return gulp.src(pathsToCopy)
    .pipe(gulp.dest('./docs/data'));
});

gulp.task('clearTemp', ['copyGeneralFiles'], function() {
  del('./temp');
  del('./assets/data');
});

gulp.task('build', ['delDistFolder', 'useminTrigger', 'copyGeneralFiles', 'clearTemp']);
