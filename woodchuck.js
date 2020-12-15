'use strict';
class WoodchuckPlugin {
  constructor(serverless) {
    this.serverless = serverless;
    this.hooks = {
      'after:package:initialize': this.addWoodchuck.bind(this)
    };
  }

  getArn(region){
    return `arn:aws:lambda:${region}:846198688143:layer:woodchuck:4`
  }
  
  buildWoodchuckConfig(config, region) {
    return {
      arn: config.arn ? config.arn : this.getArn(region),
      ...config,
    }
  }

  addWoodchuck() {
    const { service } = this.serverless;
    const { custom = {}, functions = {}, provider = {} } = service;
    const { woodchuck = {} } = custom;

    const config = this.buildWoodchuckConfig(woodchuck, provider.region);

    console.log(config);
     
    Object.values(functions).forEach(fn => {
      fn.layers = [].concat(fn.layers || [],  [config.arn])
      fn.environment = {WOODCHUCK_MAX_ITEMS:config.maxItems, WOODCHUCK_MAX_BYTES: config.maxBytes, WOODCHUCK_TIMEOUT: config.timeout, WOODCHUCK_PORT:config.port, ...fn.environment};
    })
  }

}

module.exports = WoodchuckPlugin;
