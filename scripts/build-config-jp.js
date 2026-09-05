module.exports = function (env) {
  return {
    package: {
      name: 'launcher-installer-jp',
      homepage: 'https://mahjongsoul.com/',
      author: 'Yostar, Inc.'
    },
    'electron-builder': {
      appId: 'com.launcher-installer.app-jp',
      artifactName: 'launcher-installer.${ext}'
    }
  }
}
