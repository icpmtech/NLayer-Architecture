import typescriptPlugin from '@alexlur/rollup-plugin-typescript';
import typescript from 'typescript';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';
import babel from 'rollup-plugin-babel';
import postcss from 'rollup-plugin-postcss';

import nested from 'postcss-nested';
import postcssPresetEnv from 'postcss-preset-env';
import cssnano from 'cssnano';

const dev = 'development';
const prod = 'production';

const nodeEnv = parseNodeEnv(process.env.NODE_ENV);

const plugins = [
    postcss({
        plugins: [nested(), postcssPresetEnv({ warnForDuplicates: false, }), cssnano()],
        extensions: ['.css'],
    }),
    replace({
        // The react sources include a reference to process.env.NODE_ENV so we need to replace it here with the actual value
        'process.env.NODE_ENV': JSON.stringify(nodeEnv),
    }),
    // nodeResolve makes rollup look for dependencies in the node_modules directory
    nodeResolve({ extensions: ['.js', '.ts', '.tsx'] }),
    commonjs({
        // All of our own sources will be ES6 modules, so only node_modules need to be resolved with cjs
        include: 'node_modules/**',
        namedExports: {
            // The commonjs plugin can't figure out the exports of some modules, so if rollup gives warnings like:
            // ⚠️   'render' is not exported by 'node_modules/react-dom/index.js'
            // Just add the mentioned file / export here
            'node_modules/react-dom/index.js': ['render'],
            'node_modules/react/react.js': ['Component', 'Children', 'cloneElement', 'PropTypes', 'createElement'],
        },
    }),
    typescriptPlugin({ typescript }),
    babel(
        {   babelrc: false,
            presets: [
                ["latest", { "es2015": { "modules": false } }],
                ["react"]
            ],
            plugins: [
                'babel-plugin-transform-object-assign',
                'babel-plugin-external-helpers'
            ],
            exclude: 'node_modules/**'
        })
];


if (nodeEnv === dev) {
    // Need to npm install rollup-plugin-server and
    // rollup-plugin-livereload for these to work
    plugins.push(serve({
    port: 30000,
    historyApiFallback: true,
     }));
    plugins.push(livereload());
}

if (nodeEnv === prod) {
    // Minify
    plugins.push(uglify());
}

const sourceMap = nodeEnv === dev ? 'inline' : false;

export default {
    plugins,
    sourceMap,
    moduleName: 'Adr.React',
    entry: 'main.tsx',
    dest: '../../Adr.Web/Dist/js/bundle.js',
    format: 'iife',
};

function parseNodeEnv(nodeEnv) {
    if (!!nodeEnv && (nodeEnv.trim() === prod || nodeEnv.trim() === dev)) {
        return nodeEnv.trim();
    }
    return dev;
}