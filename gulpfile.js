var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    nodemon = require('gulp-nodemon'),
    jshint = require('gulp-jshint'),
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

gulp.task('lint', function () {
  gulp.src('./**/*.js')
    .pipe(jshint())
})

gulp.task('develop', function () {
  nodemon({ script: 'server/index.js', ext: 'html js', ignore: ['ignored.js'] })
    .on('change', ['lint'])
    .on('restart', function () {
      console.log('restarted!')
    })
})

gulp.task('default', ['scripts', 'css', 'images', 'watch','less','develop'], function() {
  console.log("Gulp is starting...");
});

	
