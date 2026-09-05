/* eslint-disable no-useless-escape */
const fs = require('fs');
const path = require('path');
const prompts = require('prompts');
const { execSync } = require('child_process');
const minimist = require('minimist');
const getConfigEN = require('./build-config-en');
const getConfigJP = require('./build-config-jp');
const getConfigKR = require('./build-config-kr');

const args = minimist(process.argv.slice(2), {
  alias: {
    e: 'env',
    d: 'district',
    s: 'sha1'
  },
  string: ['e', 'd', 's']
});
const argEnv = args.e;
const argDistrict = args.d ? args.d.split(',') : undefined;

const getConfig = {
  en: getConfigEN,
  jp: getConfigJP,
  kr: getConfigKR
};

const packageStr = fs.readFileSync(path.join(__dirname, '..', './package.json'), 'utf8');
const packageData = JSON.parse(packageStr);
const electronBuilderData = fs.readFileSync(
  path.join(__dirname, '..', './electron-builder.json'),
  'utf8'
);

// const stepBuilderData = [
//   {
//     // step 0 jp
//     appId: 'com.launcher-installer.app-jp',
//     artifactName: 'launcher-installer.${ext}'
//   },
//   {
//     // step 1 kr
//     appId: 'com.launcher-installer.app-kr',
//     artifactName: 'launcher-installer.${ext}'
//   },
//   {
//     // step 2 en
//     appId: 'com.launcher-installer.app-en',
//     artifactName: 'launcher-installer.${ext}'
//   }
// ]
// const stepProjectData = [
//   {
//     // step 0 jp
//     name: 'launcher-installer-jp',
//     homepage: 'https://mahjongsoul.com/',
//     author: 'Yostar, Inc.'
//   },
//   {
//     // step 1 kr
//     name: 'launcher-installer-kr',
//     homepage: 'https://mahjongsoul.yo-star.com/kr/',
//     author: 'YOSTAR（HONG KONG）LIMITED'
//   },
//   {
//     // step 2 en
//     name: 'launcher-installer-en',
//     homepage: 'https://mahjongsoul.yo-star.com/',
//     author: 'YOSTAR（HONG KONG）LIMITED'
//   }
// ]

function deepCopy(obj, target) {
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (Array.isArray(obj[key])) {
        // 如果是数组，则将obj中的值插入到target中，而不是覆盖
        if (target[key]) target[key].push(...obj[key]);
        else target[key] = obj[key];
      } else {
        target[key] = target[key] || {};
        deepCopy(obj[key], target[key]);
      }
    } else {
      target[key] = obj[key];
    }
  }
}
function distMove(country) {
  // country: 'JP', 'KR', 'EN';
  const dir = path.join(__dirname, '..', `./build/MajSoul_${country}`);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true });

  moveFolderSync(
    path.join(__dirname, '..', `./dist/win-ia32-unpacked`),
    path.join(__dirname, '..', `./build/MajSoul_${country}`)
  );
  console.log('=> installer product has been moved to ./build/MajSoul_' + country + '\n\n');
}
function moveFolderSync(source, target) {
  if (fs.existsSync(target)) fs.rmSync(target, { recursive: true });
  fs.mkdirSync(target, { recursive: true });
  const entries = fs.readdirSync(source, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    if (entry.isDirectory()) {
      moveFolderSync(sourcePath, targetPath);
    } else {
      fs.renameSync(sourcePath, targetPath);
    }
  }
  fs.rmSync(source, { recursive: true });
}

function versionUpdate(version, part) {
  let [major, minor, patch] = version.split('.');
  switch (part) {
    case 'major':
      major = Number(major) + 1;
      minor = 0;
      patch = 0;
      break;
    case 'minor':
      minor = Number(minor) + 1;
      patch = 0;
      break;
    case 'patch':
      patch = Number(patch) + 1;
      break;
  }
  return `${major}.${minor}.${patch}`;
}

(async () => {
  const { envPart, districtPart } = await prompts([
    {
      type: argEnv ? null : 'select',
      name: 'envPart',
      message: 'installer, Which environment do you want to build?',
      choices: [
        { title: 'dev', value: 'dev' },
        { title: 'test', value: 'test' },
        { title: 'staging', value: 'staging' },
        { title: 'prod', value: 'prod' }
      ],
      initial: 0
    },
    {
      type: argDistrict ? null : 'multiselect',
      name: 'districtPart',
      message: 'Launcher, Which district package you want to build?',
      choices: [
        { title: 'EN', value: 'en', selected: true },
        { title: 'JP', value: 'jp', selected: true },
        { title: 'KR', value: 'kr', selected: true }
      ],
      hint: '- Space to select. Return to submit'
    }
  ]);

  const env = envPart || argEnv;
  const districts = districtPart || argDistrict;

  const originPackageData = JSON.stringify(packageData, null, 2);

  try {
    const currentDistDir = path.join(__dirname, '..', 'dist');
    if (fs.existsSync(currentDistDir)) fs.rmSync(currentDistDir, { recursive: true });

    districts.forEach((districtItem) => {
      const jsonPackageData = JSON.parse(originPackageData);
      deepCopy(getConfig[districtItem](env)['package'], jsonPackageData);
      const jsonElectronBuilderData = JSON.parse(electronBuilderData);
      deepCopy(getConfig[districtItem](env)['electron-builder'], jsonElectronBuilderData);
      fs.writeFileSync(
        path.join(__dirname, '..', './electron-builder.json'),
        JSON.stringify(jsonElectronBuilderData, null, 2),
        'utf-8'
      );
      fs.writeFileSync(
        path.join(__dirname, '..', './package.json'),
        JSON.stringify(jsonPackageData, null, 2),
        'utf-8'
      );

      const execDirective = `npm run _typecheck && npm run _web:${districtItem}:${env} && npm run _build:win`;

      console.log(`=> run directive: "${execDirective}"...`);

      execSync(execDirective, {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });

      distMove(String.prototype.toUpperCase.call(districtItem));
    });
  } catch (error) {
    console.error(error);
  } finally {
    fs.writeFileSync(
      path.join(__dirname, '..', './electron-builder.json'),
      electronBuilderData,
      'utf-8'
    );
    fs.writeFileSync(path.join(__dirname, '..', './package.json'), originPackageData, 'utf-8');
    console.log('\npackage.json and electron-builder.json restored to its original value.\n');
  }

  process.on('SIGINT', () => {
    console.log('\n\n=> process exit.');
    process.exit();
  });
})();
