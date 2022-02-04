const esprimiConfig = require('../esprimi-api.json');
const fs = require('fs-extra');
/**
 * Clone project
 * @param {string} dirname
 */
const cloneProject = (dirname) => {
  console.info('\nCloning project');
  const source = dirname.split('/').slice(0, -3).join('/');
  const target = dirname.split('/').slice(0, -4).join('/');
  try {
    fs.copySync(source, `${target}/${esprimiConfig['project-info']['project-name']}`);
  } catch (err) {
    throw new Error('Error cloning project');
  }
  console.info('Project cloned: OK');
}

module.exports = {
  cloneProject
};

