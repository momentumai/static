var extend = require('extend'),
    fs = require('fs'),
    path = require('path'),
    configPath = __dirname,
    baseConfigPath = path.join(configPath, 'base.config.json'),
    devConfigPath = path.join(configPath, 'dev.config.json'),
    prodConfigPath = path.join(configPath, 'prod.config.json'),
    stageConfigPath = path.join(configPath, 'stage.config.json'),
    config,
    devConfig,
    prodConfig,
    stageConfig;

function getConfig (path) {
    var cfg;

    try {
        cfg = JSON.parse(fs.readFileSync(path).toString('utf-8'));
    } catch (e) {
        cfg = null;
    }
    return cfg;
}

config = getConfig(baseConfigPath) || {};
devConfig = getConfig(devConfigPath);
prodConfig = getConfig(prodConfigPath);
stageConfig = getConfig(stageConfigPath);

if (process.env['NODE_ENV'] === 'production') {
    if (!prodConfig) {
        throw new Error('No production config');
    }
    config = extend(true, config, prodConfig);
} else if (process.env['NODE_ENV'] === 'stage') {
    if (!testConfig) {
        throw new Error('No stage config');
    }
    config = extend(true, config, stageConfig);
} else if (devConfig) {
    config = extend(true, config, devConfig);
}

module.exports = config;
