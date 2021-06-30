import { UnknownVersionError, UnrecognisedDestinationError, Destination } from "./types"
import { WoodchuckConfig } from "./configs"

const accountId = "846198688143";

const buildArn = (name: string, accountId: string, region: string, version: number) => {
  return `arn:aws:lambda:${region}:${accountId}:layer:woodchuck_${name}:${version}`
}

class Layer {
  constructor(public name: string, public versions: number[]) { }
  public getArn(region: string, version: number | undefined = undefined) {
    if (!!version) {
      if (!this.versions.includes(version)) {
        throw new UnknownVersionError(version);
      }
      return buildArn(this.name, accountId, region, version);
    }
    return buildArn(this.name, accountId, region, Math.max(...this.versions))
  }

  public getArns = (region: string) => {
    return this.versions.map(v => buildArn(this.name, accountId, region, v));
  }
}

const layers = {
  "loggly": new Layer("loggly", [3, 4, 6]),
  "logzio": new Layer("logzio", [3, 4, 5]),
}

const getLatestLayerArn = (destination: Destination, region: string): string => {
  const layer = layers[destination];
  if (!layer)
    throw new UnrecognisedDestinationError(destination);
  return layer.getArn(region);
}

const getLayerArn = (woodchuckConfig: WoodchuckConfig, region: string) => {
  const { destination } = woodchuckConfig;
  if (!!woodchuckConfig.customLayerConfig) {
    const { accountId, version } = woodchuckConfig.customLayerConfig;
    return buildArn(destination, accountId, region, version);
  }
  return getLatestLayerArn(destination, region);
}

const getLayerVersions = (destination: Destination, region: string) => {
  const layer = layers[destination];
  if (!layer)
    throw new UnrecognisedDestinationError(destination);
  return layer.getArns(region);
}

export { getLayerArn, getLayerVersions }
