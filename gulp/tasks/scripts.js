var gulp = require('gulp'),
    run = require('gulp-run'),
    babel = require('gulp-babel');

gulp.task('crawl', function() {
  return run('node ./assets/scripts/crawler').exec();
})

gulp.task('scripts', ['crawl'], function() {
  return gulp.src(['./assets/scripts/*.js', '!./assets/scripts/dataForTest.js'])
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('./temp/scripts'));
});
