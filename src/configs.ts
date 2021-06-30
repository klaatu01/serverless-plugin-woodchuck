import { MissingConfigParameterError, UnrecognisedDestinationError, Destination } from "./types"
type DestinationConfig = LogglyConfig | LogzioConfig

class LogglyConfig {
  token: string
  tag: string

  public constructor(token: string, tag: string) {
    this.token = token;
    this.tag = tag;
  }

  public static parseConfig = (config: any): LogglyConfig => {
    if (config.token == null) {
      throw new MissingConfigParameterError("config.token");
    }
    if (config.tag == null) {
      throw new MissingConfigParameterError("config.tag");
    }
    return new LogglyConfig(config.token, config.tag);
  }

  public static template = (): LogglyConfig => {
    return new LogglyConfig("<LOGGLY_TOKEN>", "<LOGGLY_TAG>");
  }

  public getEnvars = () => {
    return {
      LOGGLY_TOKEN: this.token,
      LOGGLY_TAG: this.tag,
    }
  }
}

class LogzioConfig {
  token: string
  host: string

  public constructor(token: string, host: string) {
    this.token = token;
    this.host = host;
  }

  public static parseConfig = (config: any): LogzioConfig => {
    if (config.token == null) {
      throw new MissingConfigParameterError("config.token");
    }
    if (config.host == null) {
      throw new MissingConfigParameterError("config.host");
    }
    return new LogzioConfig(config.token, config.host);
  }

  public static template = (): LogzioConfig => {
    return new LogzioConfig("<LOGZIO_TOKEN>", "<LOGZIO_HOST>");
  }

  public getEnvars = () => {
    return {
      LOGZIO_TOKEN: this.token,
      LOGZIO_HOST: this.host,
    }
  }
}

const getTemplateConfigForDestination = (destination: Destination) => {
  switch (destination) {
    case "loggly": return LogglyConfig.template();
    case "logzio": return LogzioConfig.template()
    default: throw new UnrecognisedDestinationError(destination)
  }
}

const parseDestination = (destination: any): Destination => {
  if (!destination)
    throw new MissingConfigParameterError("woodchuck.destination");
  if (destination == "loggly" || destination == "logzio")
    return destination
  throw new UnrecognisedDestinationError(destination);
}

const parseDestinationConfig = (destination: Destination, config: any): DestinationConfig => {
  if (!config)
    throw new MissingConfigParameterError("config");
  switch (destination) {
    case "loggly": return LogglyConfig.parseConfig(config)
    case "logzio": return LogzioConfig.parseConfig(config)
    default: throw new UnrecognisedDestinationError(destination)
  }
}

const getExcludedFunctions = (woodchuck: any): string[] => {
  if (!woodchuck || !woodchuck.exclude) return [];
  return woodchuck.exclude;
}

const parseWoodchuckConfig = (woodchuck: any): WoodchuckConfig => {
  let destination = parseDestination(woodchuck.destination);
  let config = parseDestinationConfig(destination, woodchuck.config);
  let excludedFunctions = getExcludedFunctions(woodchuck)
  let extensionConfig = parseExtensionConfig(woodchuck);
  let customLayerConfig = parseCustomLayerConfig(woodchuck);
  return new WoodchuckConfig(destination, config, excludedFunctions, extensionConfig, customLayerConfig);
}

const parseExtensionConfig = (woodchuck: any) => {
  const maxItems = woodchuck.maxItems;
  const maxBytes = woodchuck.maxBytes;
  const port = woodchuck.port;
  const timeout = woodchuck.timeout;
  return new ExtensionConfig(maxItems, maxBytes, timeout, port);
}

class ExtensionConfig {
  constructor(
    public maxItems?: number,
    public maxBytes?: number,
    public timeout?: number,
    public port?: number,
    public debug: boolean = false,
  ) { }

  getEnvars = () => {
    return {
      WOODCHUCK_MAX_ITEMS: this.maxItems,
      WOODCHUCK_MAX_BYTES: this.maxBytes,
      WOODCHUCK_TIMEOUT: this.timeout,
      WOODCHUCK_PORT: this.port,
      RUST_LOG: this.debug == true ? "debug" : null,
    }
  }
}

const parseCustomLayerConfig = (woodchuck: any): CustomLayerConfig | undefined => {
  if (!woodchuck.customLayerConfig)
    return undefined;
  const customLayerConfig = woodchuck.customLayerConfig;
  if (!!customLayerConfig.accountId && !!customLayerConfig.version)
    return new CustomLayerConfig(customLayerConfig.accountId, customLayerConfig.version);
}

class CustomLayerConfig {
  constructor(
    public accountId: string,
    public version: number,
  ) { }
}

class WoodchuckConfig {
  destination: Destination
  config: DestinationConfig
  excludedFunctions: string[]
  extensionConfig: ExtensionConfig;
  customLayerConfig?: CustomLayerConfig

  public constructor(destination: Destination, config: DestinationConfig, excludedFunctions: string[], extensionConfig: ExtensionConfig, customLayerConfig: CustomLayerConfig) {
    this.destination = destination;
    this.config = config;
    this.excludedFunctions = excludedFunctions;
    this.extensionConfig = extensionConfig;
    this.customLayerConfig = customLayerConfig;
  }

  public static getTemplateConfig = (destination: Destination): {} => {
    return new WoodchuckConfig(destination, getTemplateConfigForDestination(destination), undefined, undefined, undefined)
  }

}

export { LogzioConfig, LogglyConfig, WoodchuckConfig, parseWoodchuckConfig }
