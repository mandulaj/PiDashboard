var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    imagemin = require('gulp-imagemin');

var paths = {
    images: 'src/images/*',
    scripts: 'src/js/*.js',
    css: 'src/css/*.css'
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
    .pipe(imagemin({optimizationLevel: 5}))
    .pipe(gulp.dest('public/images'));
});

gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.images, ['images']);
  gulp.watch(paths.css, ['css']);
});

gulp.task('default', ['scripts', 'css', 'images', 'watch'], function() {
  console.log("Gulp is starting...");
});

	
