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
  return new WoodchuckConfig(destination, config, excludedFunctions, extensionConfig);
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
  ) { }
}

class WoodchuckConfig {
  destination: Destination
  config: DestinationConfig
  excludedFunctions: string[]
  extensionConfig: ExtensionConfig;

  public constructor(destination: Destination, config: DestinationConfig, excludedFunctions: string[], extensionConfig: ExtensionConfig) {
    this.destination = destination;
    this.config = config;
    this.excludedFunctions = excludedFunctions;
    this.extensionConfig = extensionConfig;
  }
}

export { LogzioConfig, LogglyConfig, WoodchuckConfig, parseWoodchuckConfig }
