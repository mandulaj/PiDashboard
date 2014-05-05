var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    //imagemin = require('gulp-imagemin'),
    less = require('gulp-less');

var paths = {
    images: 'src/images/*',
    scripts: 'src/js/*.js',
    css: 'src/css/*.css',
    less: 'src/less/*.less'
}

gulp.task('scripts', function() {
    return gulp.src(paths.scripts)
      .pipe(uglify())
      .pipe(concat('all.min.js'))
      .pipe(gulp.dest('public/js'));
});

gulp.task('css',function() {
	return gulp.src(paths.css)
      .pipe(gulp.dest('public/css'));	
});

gulp.task('images', function() {
 return gulp.src(paths.images)
    // Pass in options to the task
    //.pipe(imagemin({optimizationLevel: 5}))
    .pipe(gulp.dest('public/images'));
});

gulp.task('less',function() {
    return gulp.src(paths.less)
        .pipe(less())
        .pipe(gulp.dest('public/css'));
});

gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.images, ['images']);
  gulp.watch(paths.css, ['css']);
  gulp.watch(paths.less, ['less']);
});

gulp.task('default', ['scripts', 'css', 'images', 'watch','less'], function() {
  console.log("Gulp is starting...");
});

	
