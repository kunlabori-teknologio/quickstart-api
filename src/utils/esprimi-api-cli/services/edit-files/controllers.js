const fs = require('fs');
const esprimiConfig = require('../../esprimi-api.json');
const _ = require('lodash');
/**
 * Update repository file
 * @param {string} path
 * @param {any} module
 */
const updateController = (path, module) => {
  console.info(`\nWorking in ${module['name']} Controller`);
  /**
   * Get file
   */
  let controllerFile = fs.readFileSync(`${path}/src/utils/esprimi-api-cli/services/default-files/esprimi-default.controller.txt`, 'utf-8');
  let indexFile = fs.readFileSync(`${path}/src/controllers/index.ts`, 'utf-8');
  /**
   * Edit file
   */
  controllerFile = controllerFile.replace(/EsprimiDefault/g, `${module['name']}`);
  controllerFile = controllerFile.replace(/esprimiDefault/g, `${module['name'].charAt(0).toLowerCase() + module['name'].slice(1)}`);
  controllerFile = controllerFile.replace(/esprimi-default/g, `${module['route']}`);
  indexFile = indexFile.replace(
    /\/\/ End controllers/g,
    `
    export * from './${_.kebabCase(module['name'])}.controller';
    // End controllers
    `
  );
  /**
   * Save file
   */
  fs.writeFileSync(`${path}/src/controllers/${_.kebabCase(module['name'])}.controller.ts`, controllerFile, 'utf-8');
  fs.writeFileSync(`${path}/src/controllers/index.ts`, indexFile, 'utf-8');
  console.info(`${module['name']} Controller: OK`);
}
/**
 * Update controllers
 * @param {string} path
 */
const updateControllers = (path) => {
  console.info('\nWorking in Controllers');
  for (const index of esprimiConfig['modules']) {
    const module = esprimiConfig['modules'][index];
    updateController(path, module)
  }
  console.info('Controllers: OK');
}

module.exports = {
  updateControllers,
}
