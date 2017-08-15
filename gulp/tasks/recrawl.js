var gulp = require('gulp');

gulp.task('recrawl', ['crawl', 'copyGeneralFiles', 'clearTemp']);
