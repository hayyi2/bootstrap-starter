

exports.src = './src/'
exports.dist = './dist/'
exports.templates = exports.src + 'templates/'
exports.template_config = exports.templates + 'config.js'
exports.static = exports.src + 'static/'
exports.collections = exports.src + 'collections/'
exports.collection_config = exports.collections + 'config.js'
exports.collection_default = {
    layout: false,
    items: [],
    item_default: {},
    order_by: false,
}

exports.base_url = '/'
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