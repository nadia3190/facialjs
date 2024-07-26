module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Ajouter les fallbacks pour les modules Node.js
      webpackConfig.resolve.fallback = {
        crypto: require.resolve("crypto-browserify"),
        fs: false,
        stream: require.resolve("stream-browserify"),
        assert: require.resolve("assert/"),
        util: require.resolve("util/"),
        vm: require.resolve("vm-browserify"),
      };

      // Ajouter les plugins nécessaires pour les polyfills
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          process: "process/browser",
          Buffer: ["buffer", "Buffer"],
        })
      );

      return webpackConfig;
    },
  },
};
