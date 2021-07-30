module.exports = {
  module: {
      rules: [
          {
              test: /\.tshtml$/,
              use: ["tshtml-loader"],
              enforce: "pre"
          },
    ]
  }
};
