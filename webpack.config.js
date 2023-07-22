const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
// const path = require("path");

module.exports = {
  plugins: [new NodePolyfillPlugin()],
  entry: "./src/index.js",
  //   devtool: "inline-source-map",
  modules: ["node_modules"],
  // node: {
  //     'fs': 'empty'
  // },
  resolve: {
    extensions: [".jsx", ".js"],
    fallback: {
      fs: false,
      path: false,
    },
  },
  //   output: {
  //     filename: "bundle.js",
  //     path: path.resolve(__dirname, "dist"),
  //   },
  target: "node",
};
