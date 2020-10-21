/* eslint-disable @typescript-eslint/no-var-requires */
const {
  BugsnagBuildReporterPlugin,
  BugsnagSourceMapUploaderPlugin,
} = require("webpack-bugsnag-plugins");
const withSourceMaps = require("@zeit/next-source-maps");

const appVersion = process.env.VERCEL_GITHUB_COMMIT_SHA || "dev";

module.exports = withSourceMaps({
  webpack: (config) => {
    config.plugins.push(
      new BugsnagBuildReporterPlugin({
        apiKey: process.env.BUGSNAG_API_KEY,
        appVersion,
      })
    );

    config.plugins.push(
      new BugsnagSourceMapUploaderPlugin({
        apiKey: process.env.BUGSNAG_API_KEY,
        appVersion,
        overwrite: true,
      })
    );

    return config;
  },
});
