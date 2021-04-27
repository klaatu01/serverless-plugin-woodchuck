import { UnknownVersionError, UnrecognisedDestinationError, Destination } from "./types"

const accountId = "846198688143";

const buildArn = (name: string, region: string, version: number) => {
  return `arn:aws:lambda:${region}:${accountId}:layer:woodchuck_${name}:${version}`
}

class Layer {
  constructor(private name: string, private versions: number[]) { }
  public getArn(region: string, version: number | undefined = undefined) {
    if (!!version) {
      if (!this.versions.includes(version)) {
        throw new UnknownVersionError(version);
      }
      return buildArn(this.name, region, version);
    }
    return buildArn(this.name, region, Math.max(...this.versions))
  }
}

const layers = {
  "loggly": new Layer("loggly", [3]),
  "logzio": new Layer("logzio", [3]),
}

const getLatestLayerArn = (destination: Destination, region: string): string => {
  const layer = layers[destination];
  if (!layer)
    throw new UnrecognisedDestinationError(destination);
  return layer.getArn(region);
}

export { getLatestLayerArn }
