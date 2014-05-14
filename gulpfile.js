var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    nodemon = require('gulp-nodemon'),
    //jshint = require('gulp-jshint'),
    //imagemin = require('gulp-imagemin'),
    minifyCSS = require('gulp-minify-css')
    less = require('gulp-less'),
    prefix = require('gulp-autoprefixer');

var paths = {
    images: 'src/images/*',
    scripts: 'src/js/*.js',
    css: 'src/css/*.css',
    less: 'src/less/*.less'
}

/**/

gulp.task('scripts', function() {
    return gulp.src(paths.scripts)
      .pipe(uglify())
      .pipe(concat('all.min.js'))
      .pipe(gulp.dest('public/static/js'));
});

gulp.task('css',function() {
	return gulp.src(paths.css)
      .pipe(prefix(["last 1 version", "> 1%", "ie 8", "ie 7"], { cascade: true }))
      .pipe(minifyCSS())
      //.pipe(concat('stylesheet.css'))
      .pipe(gulp.dest('public/static/css'));
});

gulp.task('images', function() {
 return gulp.src(paths.images)
    // Pass in options to the task
    //.pipe(imagemin({optimizationLevel: 5}))
    .pipe(gulp.dest('public/images'));
    .pipe(gulp.dest('public/static/images'));
});

gulp.task('less',function() {
    return gulp.src(paths.less)
        .pipe(less({
            keepSpecialComments: 0,
        }))
       .pipe(gulp.dest('public/static/css'));
});

gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.images, ['images']);
  gulp.watch(paths.css, ['css']);
  gulp.watch(paths.less, ['less']);
});

gulp.task('develop', function () {
  nodemon({ script: 'server.js', ext: 'html js', ignore: ['src/**','public/**'] })
    .on('restart', function () {
      console.log('restarted!')
    })
});


gulp.task('default', ['scripts', 'css', 'images', 'watch','less','develop'], function() {
  console.log("Gulp is starting...");
});

	
