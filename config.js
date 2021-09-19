

exports.src = './src/'
exports.dist = './dist/'
exports.templates = exports.src + 'templates/'
exports.template_config = exports.src + 'config.js'
exports.static = exports.src + 'static/'

exports.vendor_dir = 'vendors/'
exports.vendors = [
    {
        src_dir: './node_modules/',
        files: [
            // 'bootstrap/dist/css/bootstrap.min.css',
            'bootstrap/dist/js/bootstrap.bundle.min.js',
            'bootstrap/dist/js/bootstrap.bundle.min.js.map',
            'bootstrap/LICENSE',
        ],
    }
]