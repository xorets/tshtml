// angular.webpack.js
module.exports = (config) => {
  config.module.rules.push({
    test: /\.tshtml($|\?)/,
    use: ['tshtml-loader'],
    enforce: 'pre'
  });
  return config;
};
