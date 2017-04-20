const browserify = require('browserify'),
  gulp = require('gulp'),
  gulpif = require('gulp-if'),
  gutil = require('gulp-util'),
  jshint = require('gulp-jshint'),
  sass = require('gulp-sass'),
  uglify = require('gulp-uglify'),
  webserver = require('gulp-webserver'),
  buffer = require('vinyl-buffer'),
  source = require('vinyl-source-stream');

const sourceDir = 'src/',
  buildDir = 'build/';

let manifest = require('./' + sourceDir + 'manifest.json');

let prod = true;

gulp.task('dev', function () {
  prod = false;
});

gulp.task('build', function () {
  manifest = require('./' + sourceDir + 'manifest.json');
  lint();
  bundlejs();
  assets();
  html();
  styles();

  gulp.src(sourceDir + 'manifest.json')
    .pipe(gulp.dest(buildDir));
});

gulp.task('lint', lint);

function lint() {
  gulp.src([sourceDir + '**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
}

gulp.task('bundlejs', bundlejs);

function bundlejs() {
  let sources = [];

  if (manifest.content_scripts) {
    for (const contentScript of manifest.content_scripts) {
      sources = sources.concat(contentScript.js);
    }
  }

  if (manifest.background) {
    sources = sources.concat(manifest.background.scripts)
  }

  for (const src of sources) {
    browserify(sourceDir + src)
      .bundle()
      .on('error', function (err) {
        console.log(err.message);
        this.emit('end');
      })
      .pipe(source(src))
      .pipe(buffer())
      .pipe(gulpif(prod, uglify().on('error', function (err) {
        gutil.log(gutil.colors.red('[Error]'), err.toString());
        this.emit('end');
      })))
      .pipe(gulp.dest(buildDir));
  }
}

gulp.task('assets', assets);

function assets() {
  gulp.src(sourceDir + 'assets/**/*')
    .pipe(gulp.dest(buildDir + 'assets'));

  gulp.src(sourceDir + '_locales/**/*')
    .pipe(gulp.dest(buildDir + '_locales'));
}

gulp.task('html', html);

function html() {
  gulp.src([sourceDir + '**/*.html'])
    .pipe(gulp.dest(buildDir));
}

gulp.task('styles', styles);

function styles() {
  if (manifest.content_scripts) {
    for (const contentScript of manifest.content_scripts) {
      for (const src of contentScript.css) {
        gulp.src([sourceDir + src])
          .pipe(sass({
            outputStyle: 'compressed'
          }).on('error', sass.logError))
          .pipe(gulp.dest(buildDir + src.substr(0, src.lastIndexOf('/'))));
      }
    }
  }
}

gulp.task('watch', function () {
  gulp.watch([sourceDir + 'manifest.json'], [
    'build'
  ]);
  gulp.watch([sourceDir + '**/*.js'], [
    'lint',
    'bundlejs'
  ]);
  gulp.watch([sourceDir + 'assets/**/*', sourceDir + '_locales/**/*'], [
    'assets'
  ]);
  gulp.watch([sourceDir + '**/*.html'], [
    'html'
  ]);
  gulp.watch([sourceDir + '**/*.scss', sourceDir + '**/*.css'], [
    'styles'
  ]);
});
