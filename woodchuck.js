"use strict";
class WoodchuckPlugin {
  constructor(serverless) {
    this.serverless = serverless;
    this.hooks = {
      "after:package:initialize": this.addWoodchuck.bind(this)
    };
  }

  getArn(region) {
    return `arn:aws:lambda:${region}:846198688143:layer:woodchuck:15`;
  }

  buildWoodchuckConfig(config, region) {
    return {
      arn: config.arn ? config.arn : this.getArn(region),
      exclude: this.getExcludedFunctions(config),
      ...config
    };
  }

  addWoodchuck() {
    const { service } = this.serverless;
    const { custom = {}, functions = {}, provider = {} } = service;
    const { woodchuck = {} } = custom;

    const config = this.buildWoodchuckConfig(woodchuck, provider.region);

    console.log(config);

    Object.getOwnPropertyNames(functions)
      .filter(name => !config.exclude.includes(name))
      .forEach(name => {
        let fn = functions[name];
        console.log(JSON.stringify(fn));
        fn.layers = [].concat(fn.layers || [], [config.arn]);
        fn.environment = {
          WOODCHUCK_MAX_ITEMS: config.maxItems,
          WOODCHUCK_MAX_BYTES: config.maxBytes,
          WOODCHUCK_TIMEOUT: config.timeout,
          WOODCHUCK_PORT: config.port,
          ...fn.environment
        };
      });
  }

  getExcludedFunctions(woodchuck) {
    if (!woodchuck || !woodchuck.exclude) return [];
    return woodchuck.exclude;
  }
}

module.exports = WoodchuckPlugin;
