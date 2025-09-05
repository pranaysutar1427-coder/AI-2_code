const path = require('path');
const fs = require('fs');
const _ = require('lodash');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
const dotenv = resolveApp('.env');

const SETTINGS = process.env.SETTINGS;
const dotSettingsFiles = SETTINGS
  ? [`${dotenv}.${SETTINGS}.local`, `${dotenv}.${SETTINGS}`]
  : [];

// First item in list has highest precedence, so one could create
// a blanket .env file with VAR1=.env and VAR2=var2 and an .env.prod
// file with just VAR1=.env.prod.
// VAR1 would be assigned .env.prod.
// VAR2 would be assigned var2
var dotenvFiles = [...dotSettingsFiles, `${dotenv}.local`, dotenv].filter(
  Boolean
);

dotenvFiles.forEach(dotenvFile => {
  if (fs.existsSync(dotenvFile)) {
    require('dotenv-expand')(
      require('dotenv').config({
        path: dotenvFile,
      })
    );
  }
});

// Just some of the variables we need
const neededVariables = ['NODE_ENV', 'URL'];
const missing = _.difference(neededVariables, Object.keys(process.env));

if (missing.length > 0) {
  throw new Error(
    'Missing the following configurations: ' + missing.join(', ')
  );
}
