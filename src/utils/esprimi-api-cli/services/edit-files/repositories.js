const fs = require('fs');
const esprimiConfig = require('../../esprimi-api.json');
const _ = require('lodash');
/**
 * Update repository file
 * @param {string} path
 * @param {any} module
 */
const updateRepository = (path, module) => {
  console.info(`\nWorking in ${module['name']} Repository`);
  /**
   * Get file
   */
  let repositoryFile = fs.readFileSync(`${path}/src/repositories/esprimi-default.repository.ts`, 'utf-8');
  let indexFile = fs.readFileSync(`${path}/src/repositories/index.ts`, 'utf-8');
  /**
   * Edit file
   */
  repositoryFile = repositoryFile.replace(/EsprimiDefault/g, `${module['name']}`);
  indexFile = indexFile.replace(
    /\/\/ End repositories/g,
    `
    export * from './${_.kebabCase(module['name'])}.repository';
    // End repositories
    `
  );
  /**
   * Save file
   */
  fs.writeFileSync(`${path}/src/repositories/${_.kebabCase(module['name'])}.repository.ts`, repositoryFile, 'utf-8');
  fs.writeFileSync(`${path}/src/repositories/index.ts`, indexFile, 'utf-8');
  console.info(`${module['name']} Repository: OK`);
}
/**
 * Update repositories
 * @param {string} path
 */
const updateRepositories = (path) => {
  console.info('\nWorking in Repositories');
  for (const index of esprimiConfig['modules']) {
    const module = esprimiConfig['modules'][index];
    updateRepository(path, module)
  }
  console.info('Repositories: OK');
}

module.exports = {
  updateRepositories,
}
