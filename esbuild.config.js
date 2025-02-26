const dotenv = require("dotenv");

const { keys } = Object;

const envPaths = {
  prod: ".env.prod"
}

const envVars = (stage) => {
  const path = envPaths[stage] || ".env"
  const envVars = dotenv.config({ path }).parsed;
  return keys(envVars).reduce((acc, key) => ({...acc,
    [`process.env.${key}`]: JSON.stringify(envVars[key]),
  }), {});
}

module.exports = (serverless) => {
  return {
    packager: "yarn",
    bundle: true,
    minify: false,
    sourcemap: true,
    keepNames: true,
    define: envVars(serverless.variables.options.stage),
  };
};
