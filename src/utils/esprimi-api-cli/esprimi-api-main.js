const esprimiConfig = require('./esprimi-api.json');
const { checkNames } = require('./services/check-names');
const { copyFolderRecursiveSync } = require('./services/copy-project-dir');

async function main() {
  try {
    /**
     * Checking names
     */
    console.info('\nChecking project name');
    checkNames([esprimiConfig['project-info']['project-name']], 'camelCase');
    console.info('\nChecking modules names');
    checkNames(esprimiConfig['modules'].map(module => module.name), 'UpperCamelCase');
    console.info('\nChecking properties names');
    checkNames(esprimiConfig['modules'].map(module => module.properties.map(property => property.name)), 'camelCase');
    /**
     * Copy project
     */
    console.info('\nCloning project');
    const source = __dirname.split('/').slice(0, -3).join('/');
    const target = __dirname.split('/').slice(0, -4).join('/');
    copyFolderRecursiveSync(source, `${target}/${esprimiConfig['project-info']['project-name']}`);

  } catch (err) {
    console.error(err.message);
  }
}

main();
