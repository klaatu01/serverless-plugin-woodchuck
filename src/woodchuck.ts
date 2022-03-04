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

    this.checkVersion();

    const woodchuckConfig = parseWoodchuckConfig(woodchuck);
    this.applyLayer(functions, service.provider, woodchuckConfig);
    this.applyPermissions(service.provider, woodchuckConfig);
  }

  checkVersion = () => {
    if (this.serverless.version < "2.61.0")
      throw new Error(`Incompatible Serverless Version.\nCurrent:  "${this.serverless.version}".\nRequires: "^2.61.0".`)
  }

  applyPermissions = (provider: any, woodchuckConfig: WoodchuckConfig) => {
    const permissions = woodchuckConfig.config.getPermissions()
    if (!permissions)
      return
    if (!provider.iamRoleStatements)
      provider.iamRoleStatements = permissions
    else
      provider.iamRoleStatements = provider.iamRoleStatements.concat(permissions)
  }

  applyLayer = (functions: any, provider: any, woodchuckConfig: WoodchuckConfig) => {
    Object.getOwnPropertyNames(functions)
      .filter(name => !woodchuckConfig.excludedFunctions.includes(name))
      .map(name => functions[name])
      .forEach(fn => {
        const arch = getArch(provider.architecture, fn);
        const layerArn = getLayerArn(woodchuckConfig, provider.region, arch);

        fn.layers = !fn.layers ? [layerArn] : fn.layers.concat([layerArn]);
        fn.environment = {
          ...woodchuckConfig.config.getEnvars(),
          ...woodchuckConfig.extensionConfig.getEnvars(),
          ...fn.environment
        };
      });
  }

}

module.exports = WoodchuckPlugin;
