module.exports = function (env) {
  return {
    package: {
      name: 'launcher-installer-en',
      homepage: 'https://mahjongsoul.yo-star.com/',
      author: 'YOSTAR（HONG KONG）LIMITED'
    },
    'electron-builder': {
      appId: 'com.launcher-installer.app-en',
      artifactName: 'launcher-installer.${ext}'
    }
  }
}
