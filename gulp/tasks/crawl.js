var gulp = require('gulp'),
    run = require('gulp-run');

gulp.task('crawl', function() {
  return run('node ./assets/scripts/crawler').exec();
});
