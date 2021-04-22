import Serverless from "serverless"
import { WoodchuckConfig, parseWoodchuckConfig } from "./configs"
import { getLatestLayerArn } from "./layers"

class WoodchuckPlugin {
  serverless: Serverless;
  hooks: { [key: string]: Function }

  constructor(serverless: Serverless) {
    this.serverless = serverless;
    this.hooks = {
      "after:package:initialize": this.addWoodchuck.bind(this)
    };
  }

  addWoodchuck = () => {
    const { service } = this.serverless;
    const { custom = {} } = service;
    const { woodchuck = {} } = custom;

    const region = service.provider.region
    const functions = service.functions
    const woodchuckConfig = parseWoodchuckConfig(woodchuck);
    const layerArn = getLatestLayerArn(woodchuck.destination, region);
    this.applyLayer(layerArn, functions, woodchuckConfig);
  }

  applyLayer = (layerArn: string, functions: any, woodchuckConfig: WoodchuckConfig) => {
    Object.getOwnPropertyNames(functions)
      .filter(name => !woodchuckConfig.excludedFunctions.includes(name))
      .forEach(name => {
        let fn = functions[name];
        fn.layers = [layerArn] || fn.layers;
        fn.environment = {
          WOODCHUCK_MAX_ITEMS: woodchuckConfig.extensionConfig.maxItems,
          WOODCHUCK_MAX_BYTES: woodchuckConfig.extensionConfig.maxBytes,
          WOODCHUCK_TIMEOUT: woodchuckConfig.extensionConfig.timeout,
          WOODCHUCK_PORT: woodchuckConfig.extensionConfig.port,
          ...fn.environment
        };
      });
  }
}

module.exports = WoodchuckPlugin;
