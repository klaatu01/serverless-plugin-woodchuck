import { MissingConfigParameterError, UnrecognisedDestinationError, Destination } from "./types"
type DestinationConfig = LogglyConfig | LogzioConfig | FirehoseConfig

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

  public getPermissions = () => undefined
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

  public getPermissions = () => undefined
}

class FirehoseConfig {
  arn: string
  metadata: {}

  public constructor(arn: string, metadata: {}) {
    this.arn = arn
    this.metadata = metadata
  }

  public static parseConfig = (config: any): FirehoseConfig => {
    if (!config.arn) {
      throw new MissingConfigParameterError("config.arn");
    }
    if (!config.metadata == null) {
      throw new MissingConfigParameterError("config.metadata");
    }
    return new FirehoseConfig(config.arn, config.metadata)
  }

  public static template = (): FirehoseConfig => {
    return new FirehoseConfig("<Firehose ARN>", { random: "data" });
  }

  public getEnvars = () => {
    return {
      WOODCHUCK_FIREHOSE_METADATA: JSON.stringify(this.metadata),
      WOODCHUCK_FIREHOSE_TARGET: this.arn,
    }
  }

  public getPermissions = () => {
    [{ Effect: "Allow", Action: "firehose:PutRecord", Resource: this.arn }]
  }
}

const getTemplateConfigForDestination = (destination: Destination) => {
  switch (destination) {
    case "loggly": return LogglyConfig.template();
    case "logzio": return LogzioConfig.template()
    case "firehose": return FirehoseConfig.template()
    default: throw new UnrecognisedDestinationError(destination)
  }
}

const parseDestination = (destination: any): Destination => {
  if (!destination)
    throw new MissingConfigParameterError("woodchuck.destination");
  if (destination == "loggly" || destination == "logzio" || destination == "firehose")
    return destination
  throw new UnrecognisedDestinationError(destination);
}

const parseDestinationConfig = (destination: Destination, config: any): DestinationConfig => {
  if (!config)
    throw new MissingConfigParameterError("config");
  switch (destination) {
    case "loggly": return LogglyConfig.parseConfig(config)
    case "logzio": return LogzioConfig.parseConfig(config)
    case "firehose": return FirehoseConfig.parseConfig(config)
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
  const debug = woodchuck.debug ?? false;
  return new ExtensionConfig(maxItems, maxBytes, timeout, port, debug);
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
      RUST_LOG: this.debug == true ? "debug" : undefined,
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

export { LogzioConfig, LogglyConfig, FirehoseConfig, WoodchuckConfig, parseWoodchuckConfig }
