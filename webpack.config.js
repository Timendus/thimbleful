const path = require('path');

module.exports = {
  entry: {
    '../docs/thimbleful.min': './src/index.js',
    'thimbleful.min':         './src/index.js',
    'energize.min':           './src/energize.js',
    'click.min':              './src/click.js',
    'filetarget.min':         './src/filetarget.js',
    'router.min':             './src/router.js'
  },

	output: {
		path: path.join(__dirname, 'dist'),
		filename: '[name].js'
	},

	devServer: {
		contentBase: path.join(__dirname, 'docs'),
		disableHostCheck: true
	}
};
