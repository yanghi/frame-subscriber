if (process.env.NODE_ENV === 'production') {
    module.exports = require('./dist/frame-subscriber.esm.js')
} else {
    module.exports = require('./dist/frame-subscriber.esm.bundle.js')
}
