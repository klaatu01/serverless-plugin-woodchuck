type Destination = "loggly" | "logzio"

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

export { MissingConfigParameterError, UnrecognisedDestinationError, Destination, UnknownVersionError };
