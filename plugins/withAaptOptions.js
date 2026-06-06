const { withAppBuildGradle } = require('@expo/config-plugins');

// Fixes: "assets_icon.png: AAPT: error: file failed to compile" on bundleRelease.
// AAPT in release mode tries to compile PNG assets placed in drawable-* dirs;
// telling it not to compress PNG files avoids the failure.
module.exports = function withAaptOptions(config) {
  return withAppBuildGradle(config, (mod) => {
    if (!mod.modResults.contents.includes('noCompress "png"')) {
      mod.modResults.contents = mod.modResults.contents.replace(
        /android\s*\{/,
        'android {\n    aaptOptions {\n        noCompress "png"\n    }',
      );
    }
    return mod;
  });
};
