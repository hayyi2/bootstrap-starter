const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const rename = require('gulp-rename');
const cssnano = require('gulp-cssnano')
const uglify = require('gulp-uglify')
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const nunjucksRender = require('gulp-nunjucks-render');
const htmlbeautify = require('gulp-html-beautify');
const data = require('gulp-data');
const merge = require("merge-stream");

const config = require('./config');

function style() {
    return gulp
        .src(config.src + 'scss/**/*.scss')
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sass())
        .pipe(cssnano())
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.dist + 'css'))
        .pipe(browserSync.stream())
}

function js() {
    return gulp
        .src(config.src + 'js/**/*.js')
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.dist + '/js'))
        .pipe(browserSync.stream())
}

function templates() {
    return gulp
        .src([
            config.templates + '**/*.html',
            '!' + config.templates+'_**/*',
        ])
        .pipe(data(function () {
            delete require.cache[require.resolve(config.template_config)];
            return {
                ...require(config.template_config), 
                vendor_dir: config.vendor_dir
            }
        }))
        .pipe(nunjucksRender({
            path: [config.templates]
        }))
        .pipe(htmlbeautify())
        .pipe(gulp.dest(config.dist))
        .pipe(browserSync.stream())
}

function watch() {
    vendors_path = {}
    config.vendors.forEach(function(item) {
        item.files.forEach(function(file) {
            vendors_path['/' + config.vendor_dir + file] = item.src_dir + file
        })
    })
    browserSync.init({
        server:{
            baseDir: [config.dist, config.static],
            routes: vendors_path
        }
    })
    gulp.watch(config.src + 'scss/**/*.scss', style)
    gulp.watch(config.src + 'js/**/*.js', js)
    gulp.watch([config.src + '**/*.html', config.template_config], templates)
        .on('change', browserSync.reload)
}

function copy_vendors() {
    list_merge = []
    config.vendors.forEach(function (item) {
        item.files.forEach(function (file) {
            list_merge.push(
                gulp
                    .src(item.src_dir + file)
                    .pipe(gulp.dest(config.dist + config.vendor_dir + file))
            )
        })
    })
    return merge(list_merge)
}

function copy_static() {
    return gulp.src([
            config.static+'**/*.*',
        ])
        .pipe(gulp.dest('./dist'))
}

exports.style = style
exports.js = js
exports.templates = templates
exports.copy_static = copy_static
exports.copy_vendors = copy_vendors

exports.watch = gulp.series(style, js, templates, watch)
exports.build = gulp.series(style, js, templates, copy_vendors, copy_static)
