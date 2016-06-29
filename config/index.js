var extend = require('extend'),
    fs = require('fs'),
    path = require('path'),
    configPath = __dirname,
    baseConfigPath = path.join(configPath, 'base.config.json'),
    devConfigPath = path.join(configPath, 'dev.config.json'),
    prodConfigPath = path.join(configPath, 'prod.config.json'),
    config,
    exports = {},
    devConfig,
    prodConfig;

function getConfig (path) {
    var cfg;

    try {
        cfg = JSON.parse(fs.readFileSync(path).toString('utf-8'));
    } catch (e) {
        cfg = null;
    }
    return cfg;
}

devConfig = getConfig(baseConfigPath) || {};
prodConfig = getConfig(baseConfigPath) || {};

devConfig = extend(true, devConfig, getConfig(prodConfigPath));
prodConfig = extend(true, prodConfig, getConfig(devConfigPath));

exports.dev = devConfig;
exports.prod = prodConfig;

module.exports = exports;
