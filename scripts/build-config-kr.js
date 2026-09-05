module.exports = function (env) {
  return {
    package: {
      name: 'launcher-installer-kr',
      homepage: 'https://mahjongsoul.yo-star.com/kr/',
      author: 'YOSTAR（HONG KONG）LIMITED'
    },
    'electron-builder': {
      appId: 'com.launcher-installer.app-kr',
      artifactName: 'launcher-installer.${ext}'
    }
  }
}
