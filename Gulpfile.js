
var gulp   = require('gulp');
var sass = require('gulp-sass');
var runSequence = require('run-sequence');
var del = require('del');
var bs = require('browser-sync').create(); // create a browser sync instance.

//Browser Sync
    gulp.task('browser-sync', function() {
      bs.init({
        server: {
            baseDir: "./prod"
        }
      });
      gulp.watch("./prod/assets/scss/**/*.scss", ['sass:prod']).on('change', bs.reload);
      gulp.watch("./prod/assets/js/**/*.js").on('change', bs.reload);
      gulp.watch("./prod/assets/img/**/*").on('change', bs.reload);
      gulp.watch("./prod/**/*.html").on('change', bs.reload);
    });

//Compile .scss
    gulp.task('sass', function () {
      return gulp.src('prod/assets/scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('dist/assets/css'));
    });

    gulp.task('sass:prod', function () {
      return gulp.src('prod/assets/scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('prod/assets/css'));
    });

//Copy HTML
    gulp.task('html', function() {
      gulp.src('./prod/**/*.*')
        .pipe(gulp.dest('./dist/'));
    })


//Copy JS
    gulp.task('js', function() {
        return gulp.src(['prod/assets/js/**/*.*'])
                .pipe(gulp.dest('dist/assets/js/'));
    });


//Before BUILD
    gulp.task('clean', del.bind(null, [
      './dist',
    ]));


gulp.task('build', function(callback) {
  runSequence('html',
              ['sass', 'js', 'bsjs', 'fonts'],
              'split',
              callback);
});
