import Serverless from "serverless"
import { WoodchuckConfig, parseWoodchuckConfig } from "./configs"
import { getLayerArn, printLayerVersions } from "./layers"
import { getArch } from "./utils"

class WoodchuckPlugin {
  serverless: Serverless;
  hooks: { [key: string]: Function }
  commands: any
  options: any

  constructor(serverless: Serverless, options: Serverless.Options) {
    this.serverless = serverless;
    this.options = options;
    this.commands = {
      woodchuck: {
        lifecycleEvents: [
          "list"
        ]
      }
    }
    this.hooks = {
      "after:package:initialize": this.addWoodchuck.bind(this),
      "woodchuck:list": printLayerVersions.bind(this)
    };
  }

  addWoodchuck = () => {
    const { service } = this.serverless;
    const { custom = {} } = service;
    const { woodchuck = {} } = custom;

    const functions = service.functions
    const woodchuckConfig = parseWoodchuckConfig(woodchuck);
    this.applyLayer(functions, service.provider, woodchuckConfig);
  }

  applyLayer = (functions: any, provider: any, woodchuckConfig: WoodchuckConfig) => {
    Object.getOwnPropertyNames(functions)
      .filter(name => !woodchuckConfig.excludedFunctions.includes(name))
      .map(name => functions[name])
      .forEach(fn => {
        const arch = getArch(provider.architecture, fn);
        const layerArn = getLayerArn(woodchuckConfig, provider.region, arch);

        fn.layers = [layerArn] || fn.layers;
        fn.environment = {
          ...woodchuckConfig.config.getEnvars(),
          ...woodchuckConfig.extensionConfig.getEnvars(),
          ...fn.environment
        };
      });
  }

}

module.exports = WoodchuckPlugin;
