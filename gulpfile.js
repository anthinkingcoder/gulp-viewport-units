const gulp = require('gulp');
const viewportUnits = require('./index.js')
const del = require('del');
const sass = require('gulp-sass');

gulp.task('clean', function (cb) {
    return del(['example/dist'], cb);
});

gulp.task('css', ['clean'], function (cb) {
    gulp.src('example/**/*.css')
        .pipe(viewportUnits({'onlyCalc': false,selectorBlackList:['.notSelector']}))
        .pipe(gulp.dest('example/dist'));
});


gulp.task('sass', ['clean'], function (cb) {
    gulp.src('example/**/*.scss')
        .pipe(sass())
        .pipe(viewportUnits({selectorBlackList:['.notSelector','.demo']}))
        .pipe(gulp.dest('example/dist'));
});
