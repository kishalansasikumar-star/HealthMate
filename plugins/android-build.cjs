const { withAppBuildGradle } = require("expo/config-plugins");

// Keep generated C++ object paths within Windows build-tool limits.
module.exports = (config) =>
  withAppBuildGradle(config, (mod) => {
    const marker = "    defaultConfig {";
    const argument =
      'externalNativeBuild.cmake.arguments "-DCMAKE_OBJECT_PATH_MAX=240"';
    if (!mod.modResults.contents.includes(argument)) {
      mod.modResults.contents = mod.modResults.contents.replace(
        marker,
        marker + "\n        " + argument,
      );
    }
    return mod;
  });
