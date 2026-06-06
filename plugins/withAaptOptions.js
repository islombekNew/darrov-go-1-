const { withAppBuildGradle } = require('@expo/config-plugins');

// Fixes: "assets_icon.png: AAPT: error: file failed to compile" on bundleRelease.
// Root cause: release builds enable PNG crunching by default (debug has it off).
// AAPT2's crunch step fails on certain PNGs (transparency, color profiles, etc).
// Fix: disable crunchPngs in release buildType — same behaviour as debug.
module.exports = function withAaptOptions(config) {
  return withAppBuildGradle(config, (mod) => {
    let contents = mod.modResults.contents;

    // 1. Disable PNG crunching in release buildType
    if (!contents.includes('crunchPngs false')) {
      contents = contents.replace(
        /release\s*\{/,
        'release {\n            crunchPngs false',
      );
    }

    // 2. Also set noCompress as belt-and-suspenders
    if (!contents.includes('noCompress "png"')) {
      contents = contents.replace(
        /android\s*\{/,
        'android {\n    aaptOptions {\n        noCompress "png"\n    }',
      );
    }

    mod.modResults.contents = contents;
    return mod;
  });
};
