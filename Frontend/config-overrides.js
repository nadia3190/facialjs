const webpack = require("webpack");
const path = require("path"); // Ajout de l'importation du module `path`

module.exports = function override(config) {
  // Ajouter les fallbacks pour les modules Node.js
  config.resolve.fallback = {
    crypto: require.resolve("crypto-browserify"),
    fs: false,
    stream: require.resolve("stream-browserify"),
    assert: require.resolve("assert/"),
    util: require.resolve("util/"),
    vm: require.resolve("vm-browserify"),
  };

  // Ajouter les plugins nécessaires pour les polyfills
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    })
  );

  return config;
};

module.exports.devServer = function overrideDevServer(config) {
  config.static = [
    {
      directory: path.join(__dirname, "public"),
      publicPath: "/",
    },
  ];
  return config;
};
