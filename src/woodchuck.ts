import Serverless from "serverless"
import { WoodchuckConfig, parseWoodchuckConfig } from "./configs"
import { getLatestLayerArn } from "./layers"
import { addNewObject } from "./utils"

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
          "init"
        ],
        options: {
          init: {
            required: true,
            shortcut: 'i',
            usage: "Init woodchuck configuration for a target destination."
          }
        }
      }
    }
    this.hooks = {
      "after:package:initialize": this.addWoodchuck.bind(this),
      "woodchuck:init": this.initWoodchuck.bind(this)
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
          ...woodchuckConfig.config.getEnvars(),
          ...woodchuckConfig.extensionConfig.getEnvars(),
          ...fn.environment
        };
      });
  }

  initWoodchuck = async () => {
    const slsFilePath = (this.serverless as any).configurationPath
    this.serverless.yamlParser.parse(slsFilePath).then((file) => {
      if (!!file.custom && !!file.custom.woodchuck) {
        throw new Error("Woodchuck: A woodchuck configuration already exists at 'custom.woodchuck'. Please remove it and run this command again.");
      } else {
        const config = JSON.parse(JSON.stringify(WoodchuckConfig.getTemplateConfig(this.options.init)))
        addNewObject(slsFilePath, "custom.woodchuck", config);
        this.serverless.cli.log(`Woodchuck: Added template configuration for '${this.options.init}' to your serverless.yml`)
      }
    })
  }
}

module.exports = WoodchuckPlugin;
