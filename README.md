# serverless-plugin-woodchuck
[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)

Serverless plugin for automatic JSON log forwarding to cloud-based log management tools.

## Features

Supported Runtimes:
* [x] nodejs14.x
* [x] nodejs12.x
* [x] nodejs10.x
* [x] python3.7
* [x] python2.7
* [x] dotnet6.0
* [x] dotnetcore3.1
* [x] dotnetcore2.1
* [ ] go1.x
* [ ] java11
* [ ] java8.al2
* [ ] java8
* [ ] ruby2.7
* [ ] ruby2.5

Supported Log Destinations:
* [x] Loggly
* [x] Logz.io

## Install

### Serverless

```sh
serverless plugin install --name serverless-plugin-woodchuck
```

### Manually

```sh
yarn add --dev serverless-plugin-woodchuck
# or
npm install -D serverless-plugin-woodchuck
```

Add the following plugin to your `serverless.yml`:

```yaml
plugins:
  - serverless-plugin-woodchuck
```

Add the relevant config for your logging platform:

#### Loggly Example Configuration:

```yaml
custom:
  woodchuck:
    destination: "loggly"
    config: 
      token: <loggly-token>
      tag: <loggly-tag>
```

#### Logzio Example Configuration:

```yaml
custom:
  woodchuck:
    destination: "logzio"
    config: 
      token: <logzio-token>
      host: <logzio-host> # these are usually like: "listener.logz.io"
```

For more information on Woodchuck and configuring look at its [repo](https://www.github.com/klaatu01/woodchuck)

### Excluding functions

The `exclude` array can be used to exclude the Woodchuck layer from a function.

In this example only "functionA" function will have the Woodchuck lambda layer.

```yaml
functions:
  functionA:
    handler: handler.handler
    events:
      - http:
          method: get
          path: a
  functionB:
    handler: handler.handler
    events:
      - http:
          method: get
          path: b

custom:
  woodchuck:
    exclude:
      - functionB
```

