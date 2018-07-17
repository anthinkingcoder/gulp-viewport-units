const gulp = require('gulp');
const viewportUnits = require('./index.js')
const del = require('del');

gulp.task('clean', function (cb) {
    return del(['example/dist'], cb);
});


gulp.task('css', ['clean'], function (cb) {
    gulp.src('example/**/*.css')
        .pipe(viewportUnits())
        .pipe(gulp.dest('example/dist'));
});
