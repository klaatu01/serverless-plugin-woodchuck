import { UnknownVersionError, UnrecognisedDestinationError, Destination, Arch, NoLayerFound } from "./types"
import { WoodchuckConfig } from "./configs"

const accountId = "846198688143";

const buildArn = (name: string, accountId: string, region: string, arch: string, version: number) => {
  return `arn:aws:lambda:${region}:${accountId}:layer:woodchuck_${name}_${arch}:${version}`
}

class LayerVersion {
  constructor(public name: Destination, public supportedRegions: string[], public supportedArchitectures: string[], public version: number) { }
  toString = () => JSON.stringify(this);
}


class Layer {
  constructor(public destination: Destination, public region: string, public arch: Arch, public version: number) { }
  public getArn() {
    return buildArn(this.destination, accountId, this.region, this.arch, this.version)
  }
}

const layerVersions = [
  new LayerVersion("loggly", ["eu-west-1", "eu-west-2"], ["x86_64", "arm64"], 4),
  new LayerVersion("loggly", ["eu-west-1", "eu-west-2", "eu-central-1", "us-east-1", "us-west-2", "us-east-2"], ["x86_64", "arm64"], 3),
  new LayerVersion("logzio", ["eu-west-1", "eu-west-2"], ["x86_64", "arm64"], 4),
  new LayerVersion("logzio", ["eu-west-1", "eu-west-2", "eu-central-1", "us-east-1", "us-west-2", "us-east-2"], ["x86_64", "arm64"], 3),
]

const getCompatibleLayerVersions = (destination: Destination, region: string, arch: Arch) =>
  layerVersions
    .filter(layer => (layer.name == destination && layer.supportedRegions.includes(region) && layer.supportedArchitectures.includes(arch)))

const getLatestLayer = (destination: Destination, region: string, arch: Arch) => {
  const compatibleLayers =
    getCompatibleLayerVersions(destination, region, arch)
      .sort(layer => layer.version)
      .map(layer => new Layer(destination, region, arch, layer.version))

  if (compatibleLayers.length == 0)
    throw new NoLayerFound(destination, region, arch);

  return compatibleLayers[0]
}

const getLayerArn = (woodchuckConfig: WoodchuckConfig, region: string, arch: Arch) => {
  const { destination } = woodchuckConfig;
  if (!!woodchuckConfig.customLayerConfig) {
    const { accountId, version } = woodchuckConfig.customLayerConfig;
    return buildArn(destination, accountId, region, arch, version);
  }
  return getLatestLayer(destination, region, arch).getArn();
}

const printLayerVersions = () => {
  layerVersions
    .map(version => version.toString())
    .forEach(version => console.log(version))
}

export { getLayerArn, getCompatibleLayerVersions, getLatestLayer, layerVersions, printLayerVersions, buildArn }
