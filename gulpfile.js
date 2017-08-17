var gulp;
gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var ngmin = require('gulp-ngmin');

var paths = {
    app: ['web/Public/Home/src/**/*.js'],
};

gulp.task('app', function () {
    gulp.src(paths.app)
        .pipe(concat('release.js'))
        .pipe(gulp.dest('web/Public/Home/js'))
});

gulp.task('watch', function () {
    gulp.watch(paths.app, ['app']);
});
