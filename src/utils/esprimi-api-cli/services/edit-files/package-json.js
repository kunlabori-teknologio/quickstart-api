const fs = require('fs');
const esprimiConfig = require('../../esprimi-api.json');
/**
 * Update file
 * @param {string} path
 */
const updatePackageJson = (path) => {
  console.info('\nWorking in package.json')
  /**
   * Get file
   */
  let packageJsonFile = fs.readFileSync(`${path}/package.json`, 'utf-8');
  let indexHtmlFile = fs.readFileSync(`${path}/public/index.html`, 'utf-8');
  /**
   * Edit file
   */
  packageJsonFile = packageJsonFile.replace(/quickstart-api/g, esprimiConfig['project-info']['project-name']);
  packageJsonFile = packageJsonFile.replace(/Quickstart API/g, esprimiConfig['project-info']['description']);
  indexHtmlFile = indexHtmlFile.replace(/quickstart-api/g, esprimiConfig['project-info']['project-name']);
  /**
   * Save file
   */
  fs.writeFileSync(`${path}/package.json`, packageJsonFile, 'utf-8');
  fs.writeFileSync(`${path}/public/index.html`, indexHtmlFile, 'utf-8');
  console.info('Package.json: OK');
}

module.exports = {
  updatePackageJson,
}
