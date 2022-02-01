const esprimiConfig = require('./esprimi-api.json');
const { checkNames } = require('./services/check-names');
const { cloneProject } = require('./services/clone-project');
const { updateControllers } = require('./services/edit-files/controllers');
const { updateDotEnv } = require('./services/edit-files/env');
const { updateModels } = require('./services/edit-files/models');
const { updatePackageJson } = require('./services/edit-files/package-json');
const { updateRepositories } = require('./services/edit-files/repositories');

async function main() {
  try {
    /**
     * Checking names
     */
    console.info('\nChecking project name');
    checkNames([esprimiConfig['project-info']['project-name']], 'spinal-case');
    console.info('\nChecking modules names');
    checkNames(esprimiConfig['modules'].map(module => module.name), 'UpperCamelCase');
    console.info('\nChecking modules routes');
    checkNames(esprimiConfig['modules'].map(module => module.route), 'spinal-case');
    console.info('\nChecking properties names');
    checkNames(esprimiConfig['modules'].map(module => module.properties.map(property => property.name)), 'camelCase');
    /**
     * Cloning project
     */
    cloneProject(__dirname);
    /**
     * Get new path
     */
    const projectsPath = __dirname.split('/').slice(0, -4).join('/');
    const newProjectPath = `${projectsPath}/${esprimiConfig['project-info']['project-name']}`;
    /**
     *
     * Update files
     *
     * Package.json
     */
    updatePackageJson(newProjectPath);
    /*
     * .env
     */
    updateDotEnv(newProjectPath);
    /*
     * Models
     */
    updateModels(newProjectPath);
    /*
     * Repositories
     */
    updateRepositories(newProjectPath);
    /*
     * Controllers
     */
    updateControllers(newProjectPath);
    /**
     * Finish
     */
    console.info('\nAPI created. Go to folder, run npm install and npm start\n');

  } catch (err) {
    console.error(err.message);
  }
}

main();
