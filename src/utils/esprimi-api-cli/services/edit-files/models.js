const fs = require('fs');
const esprimiConfig = require('../../esprimi-api.json');
const _ = require('lodash');
/**
 * Add attributes in file
 * @param {array} attrs
 * @param {file} file
 * @returns file
 */
const createAttrs = (attrs, file) => {
  const addAttr = (name, type, itemType) => {
    /**
     * Create attribute
     */
    if (type === 'array') {
      return (
        `
        @property({
          type: 'array',
          itemType: '${itemType}',
        })
        ${name}?: ${itemType}[];
        // End properties
        `
      );
    }
    return (
      `
      @property({
        type: '${type}',
      })
      ${name}?: ${type};
      // End properties
      `
    );
  }
  /**
   * Create attributes
   */
  for (let index = 0; index < attrs.length; index++) {
    const attr = attrs[index];
    file = file.replace(/\/\/ End properties/g, addAttr(attr.name, attr.type, attr.itemType));
  }
  return file;
}
/**
 * Update model file
 * @param {string} path
 * @param {any} module
 */
const updateModel = (path, module) => {
  console.info(`\nWorking in ${module['name']} Model`);
  /**
   * Get file
   */
  let modelFile = fs.readFileSync(`${path}/src/models/esprimi-default.model.ts`, 'utf-8');
  let indexFile = fs.readFileSync(`${path}/src/models/index.ts`, 'utf-8');
  /**
   * Edit file
   */
  modelFile = modelFile.replace(/EsprimiDefault/g, `${module['name']}`);
  modelFile = createAttrs(module['properties'], modelFile);
  indexFile = indexFile.replace(
    /\/\/ End models/g,
    `
    export * from './${_.kebabCase(module['name'])}.model';
    // End models
    `
  );
  /**
   * Save file
   */
  fs.writeFileSync(`${path}/src/models/${_.kebabCase(module['name'])}.model.ts`, modelFile, 'utf-8');
  fs.writeFileSync(`${path}/src/models/index.ts`, indexFile, 'utf-8');
  console.info(`${module['name']} Model: OK`);
}
/**
 * Update models
 * @param {string} path
 */
const updateModels = (path) => {
  console.info('\nWorking in Models');
  for (let index = 0; index < esprimiConfig['modules'].length; index++) {
    const module = esprimiConfig['modules'][index];
    updateModel(path, module)
  }
  console.info('Models: OK');
}

module.exports = {
  updateModels,
}
