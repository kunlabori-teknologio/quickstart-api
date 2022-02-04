const fs = require('fs');
const esprimiConfig = require('../../esprimi-api.json');
/**
 * Update file
 * @param {string} path
 */
const updateDotEnv = (path) => {
  console.info('\nWorking in .env')
  /**
   * Get file
   */
  let envFile = fs.readFileSync(`${path}/.env.example`, 'utf-8');
  /**
   * Edit file
   */
  envFile = envFile.replace(/PROJECT_ID=/g, `PROJECT_ID=${esprimiConfig['project-info']['project-id']}`);
  envFile = envFile.replace(/PROJECT_SECRET=/g, `PROJECT_SECRET=${esprimiConfig['project-info']['project-secret']}`);
  envFile = envFile.replace(/MONGO_URL=/g, `MONGO_URL=${esprimiConfig['database-info']['mongo-url']}`);
  /**
   * Save file
   */
  fs.writeFileSync(`${path}/.env`, envFile, 'utf-8');
  console.info('.env: OK');
}

module.exports = {
  updateDotEnv,
}
