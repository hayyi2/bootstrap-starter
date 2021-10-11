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
const fs = require('fs')
const yamlFront = require('yaml-front-matter');

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

function get_collections_data() {
    delete require.cache[require.resolve(config.collection_config)];
    collection_config = require(config.collection_config)
    result = {}
    for (const [key, args] of Object.entries(collection_config)) {
        result[key] = { ...config.collection_default, ...args }
        result[key].use_file = false
        try {
            fs.lstatSync(config.collections + key).isDirectory()
            result[key].use_file = true
        } catch (e) {
            // console.log(e)
        }
        if (result[key].use_file){
            result[key].items = []
            files = fs.readdirSync(config.collections + key);
            files.forEach(file => {
                slug = file.split('.')[0]
                const content = fs.readFileSync(config.collections + key + '/' + file, 'utf8')
                result[key].items.push({
                    ...result[key].item_default, 
                    ...yamlFront.loadFront(content),
                    slug,
                    url: key + "/" + slug + '.html'
                })
            });
        }
        if (result[key].order_by){
            result[key].items.sort((a, b) => (a[result[key].order_by] > b[result[key].order_by]) ? 1 : -1)
        }
        
    }
    
    return result
}
function templates() {
    templates_data = {
        base_url: config.base_url,
        vendor_dir: config.vendor_dir,
    }
    list_merge = []
    data_collections = get_collections_data()
    collection_items = {}
    for (const [key, args] of Object.entries(data_collections)) {
        collection_items[key] = []
        for (const item of args.items) {
            collection_items[key].push(item)
        }
    }
    for (const [key, args] of Object.entries(data_collections)) {
        if (args.use_file && args.layout) {
            args.items.forEach(item => {
                list_merge.push(
                    gulp
                        .src(config.templates + args.layout)
                        .pipe(rename(function (path) {
                            path.basename = item.slug;
                        }))
                        .pipe(nunjucksRender({
                            path: [config.templates],
                            data: {
                                ...templates_data,
                                ...item,
                            }
                        }))
                        .pipe(htmlbeautify())
                        .pipe(gulp.dest(config.dist + key))
                )
            });
        }
    }
    list_merge.push(
        gulp
            .src([
                config.templates + '**/*.html',
                '!' + config.templates+'_**/*',
            ])
            .pipe(data(function () {
                delete require.cache[require.resolve(config.template_config)];
                return {
                    ...templates_data,
                    ...require(config.template_config),
                    collections: collection_items,
                }
            }))
            .pipe(nunjucksRender({
                path: [config.templates]
            }))
            .pipe(htmlbeautify())
            .pipe(gulp.dest(config.dist))
    )
    return merge(list_merge)
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
    gulp.watch([
        config.src + '**/*.html', 
        config.template_config,
        config.collections + '**/*.md',
        config.collection_config,
    ], templates).on('change', browserSync.reload)
}

function copy_vendors() {
    list_merge = []
    config.vendors.forEach(function (item) {
        item.files.forEach(function (file) {
            file_dir = file.split('/').slice(0, -1).join('/')
            list_merge.push(
                gulp
                    .src(item.src_dir + file)
                    .pipe(gulp.dest(config.dist + config.vendor_dir + file_dir))
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

exports.log_collection_data = function(cl) {
    console.log(get_collections_data())
    cl()
}

exports.watch = gulp.series(style, js, templates, watch)
exports.build = gulp.series(style, js, templates, copy_vendors, copy_static)
