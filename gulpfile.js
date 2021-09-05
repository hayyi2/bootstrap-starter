const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const rename = require('gulp-rename');
const cssnano = require('gulp-cssnano')
const uglify = require('gulp-uglify')
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();

function style() {
    return gulp
        .src('./src/scss/**/*.scss')
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sass())
        .pipe(cssnano())
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/css'))
        .pipe(browserSync.stream())
}

function js() {
    return gulp
        .src('./src/js/**/*.js')
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/js'))
        .pipe(browserSync.stream())
}

function watch() {
    browserSync.init({
        server:{
            baseDir: './'
        }
    })
    gulp.watch('./src/scss/**/*.scss', style)
    gulp.watch('./**/*.html').on('change', browserSync.reload)
}

function copy_bootstrap_js() {
    return gulp.src([
            './node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
            './node_modules/bootstrap/dist/js/bootstrap.bundle.min.js.map',
        ])
        .pipe(gulp.dest('./dist/vendors/bootstrap/js'))
}
function copy_bootstrap_license() {
    return gulp.src([
            './node_modules/bootstrap/LICENSE',
        ])
        .pipe(gulp.dest('./dist/vendors/bootstrap/'))
}

const vendors = [copy_bootstrap_js, copy_bootstrap_license]

exports.style = style
exports.js = js
exports.vendors = gulp.series(vendors)

exports.watch = gulp.series(style, js, ...vendors, watch)
exports.build = gulp.series(style, js, ...vendors)