const path = require('path');

module.exports = {
    devtool: 'inline-source-map',
    entry: './src/index.ts',
    output: {
        filename: './bundle.js'
    },
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx'],
    },
    module: {
        rules: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            { test: /\.ts$/, loader: 'ts-loader' }
        ]
    }
}