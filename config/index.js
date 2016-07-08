var extend = require('extend'),
    fs = require('fs'),
    path = require('path'),
    configPath = __dirname,
    baseConfigPath = path.join(configPath, 'base.config.json'),
    devConfigPath = path.join(configPath, 'dev.config.json'),
    prodConfigPath = path.join(configPath, 'prod.config.json'),
    testConfigPath = path.join(configPath, 'test.config.json'),
    config,
    devConfig,
    prodConfig,
    testConfig;

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
testConfig = getConfig(testConfigPath);

if (process.env['NODE_ENV'] === 'production') {
    if (!prodConfig) {
        throw new Error('No production config');
    }
    config = extend(true, config, prodConfig);
} else if (process.env['NODE_ENV'] === 'test') {
    if (!testConfig) {
        throw new Error('No test config');
    }
    config = extend(true, config, testConfig);
} else if (devConfig) {
    config = extend(true, config, devConfig);
}

module.exports = config;
