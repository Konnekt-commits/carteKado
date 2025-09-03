const NodemonPlugin = require('nodemon-webpack-plugin');
const { merge } = require('webpack-merge');
const path = require('path');

const fs = require('fs');
// const webpack = require('webpack')

const env = process.env.NODE_ENV || 'development';
const externals = {};
fs.readdirSync('node_modules')
    .filter(x => ['.bin'].indexOf(x) === -1)
    .forEach(mod => {
        externals[mod] = `commonjs ${mod}`;
        // externals[mod] = `es6 ${mod}`;
        // console.log(mod)
    });

const baseConfig = {
    externals,
    context: path.resolve('./src'),
    target: 'node',
    mode: env,
    entry: {
        index: './server.ts',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        sourceMapFilename: '[name].map',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.ts'],
        modules: [path.resolve('./src'), 'node_modules'],
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },

};

const developmentConfig = {
    devtool: 'eval',
    plugins: [
        // new webpack.DefinePlugin({
        //   'process.env': {
        //     NODE_ENV: JSON.stringify(process.env.NODE_ENV)
        //   }
        // }),
        new NodemonPlugin()
    ],
};

const productionConfig = {
    plugins: [
        // new webpack.DefinePlugin({
        //   'process.env': {
        //     NODE_ENV: JSON.stringify(process.env.NODE_ENV)
        //   }
        // }),
    ],
}

module.exports = merge(baseConfig, env === 'development' ? developmentConfig : productionConfig);
