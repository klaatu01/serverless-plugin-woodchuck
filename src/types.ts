type Destination = "loggly" | "logzio" | "firehose"
type Arch = "x86_64" | "arm64"

class MissingConfigParameterError implements Error {
  name = "MissingConfigParameter"
  message: string
  public constructor(parameterName: string) {
    this.message = `Config Parameter '${parameterName}' must be declared`
  }
}

class UnrecognisedDestinationError implements Error {
  name = "UnrecognisedDestination"
  message: string
  public constructor(destinationName: string) {
    this.message = `UnrecognisedDestination '${destinationName}'`;
  }
}

class UnknownVersionError implements Error {
  name = "UnrecognisedDestination"
  message: string
  public constructor(version: number) {
    this.message = `Unknown version '${version}'`;
  }
}

class NoLayerFound implements Error {
  name = "NoLayerFound"
  message: string
  public constructor(destination: string, region: string, arch: string) {
    this.message = `No Layer found for'`;
  }
}

export { Arch, MissingConfigParameterError, UnrecognisedDestinationError, Destination, UnknownVersionError, NoLayerFound };
