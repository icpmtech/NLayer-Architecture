var webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");

var config = {
    context: __dirname,
    entry: ['babel-polyfill', './main.tsx'],
    output: {
        filename: '../../Adr.Web/Dist/js/bundle.js'
    },
    module: {
        rules: [{
            enforce: "pre",
            test: /\.(js|tsx)$/,
            exclude: /react-rte/,
            use: "source-map-loader"
        },
        {
            test: /\.ts(x?)$/,
            exclude: /node_modules/,
            use: ['babel-loader','ts-loader']
        },
        {   test: /\.css$/, 
            use: ['style-loader','css-loader']
        }
      ]
    },
    cache: true,
    resolve: { extensions: ['.js', '.ts', '.tsx'] }
};

/*
 * if we decide to host react & dom elsewhere we can use this
externals: {
  "react": "React",
  "react-dom": "reactDOM"
}
//*/

module.exports = function(env) {
  if(env === "dev") {
    config.devtool = "inline-source-map";
  }
  else {
    config.optimization = {
      minimize: true,
      minimizer: [new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false
      })],
    }
  }
  return [config];
};

