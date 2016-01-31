var browserify = require('browserify'),
	gulp = require('gulp'),
	gulpif = require('gulp-if'),
	jshint = require('gulp-jshint'),
	sass = require('gulp-sass'),
	uglify = require('gulp-uglify'),
	webserver = require('gulp-webserver'),
	buffer = require('vinyl-buffer'),
	source = require('vinyl-source-stream');

var prod = true;

gulp.task('dev', function () {
	prod = false;
});

gulp.task('build', function () {
	lint();
	bundlejs();
	images();
	views();
	styles();
});

gulp.task('serve', function() {
	gulp.src('./build')
    .pipe(webserver({
      livereload: true,
      directoryListing: false,
      open: true,
      fallback: 'index.html'
    }));
});

gulp.task('lint', lint);
function lint() {
	gulp.src(['app/app.js', 'app/**/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
}

gulp.task('bundlejs', bundlejs);
function bundlejs() {
	browserify('./app/app.js')
		.bundle()
		.on('error', function(err){
      console.log(err.message);
      this.emit('end');
    })
    .pipe(source('bundle.js'))
		.pipe(buffer())
		.pipe(gulpif(prod, uglify().on('error', function(err){
      console.log(err.message);
      this.emit('end');
    })))
		.pipe(gulp.dest('./build'));
}

gulp.task('images', images);
function images() {
	gulp.src('./app/img/*')
		.pipe(gulp.dest('./build/img'));
}

gulp.task('views', views);
function views() {
	gulp.src(['./app/index.html', './app/**/*.html'])
		.pipe(gulp.dest('./build'));
}

gulp.task('styles', styles);
function styles() {
	gulp.src(['app/main.scss'])
		.pipe(sass({
			outputStyle: 'compressed'
		}).on('error', sass.logError))
		.pipe(gulp.dest('./build'));
}

gulp.task('watch', function () {
	gulp.watch(['app/app.js', 'app/**/*.js'], [
		'lint',
		'bundlejs'
	]);
	gulp.watch(['app/img/*'], [
		'images'
	]);
	gulp.watch(['app/index.html', 'app/**/*.html'], [
		'views'
	]);
	gulp.watch(['app/main.scss', 'app/**/*.scss', 'app/**/*.css'], [
		'styles'
	]);
});
