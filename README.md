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


### Example Configuration

This will ship logs to loggly with the source group `profile-service`, using a token stored in Parameter Store.

```yaml
custom:
  woodchuck:
    destination: "loggly"
    config: 
      token: ${ssm:LOGGLY_TOKEN}
      tag: profile-service
```

### Destinations

Woodchuck can be configured to ship logs to a range of supported platforms.

#### Loggly

```yaml
custom:
  woodchuck:
    destination: "loggly"
    config: 
      token: <loggly-token>
      tag: <loggly-tag>
```

#### Logzio

```yaml
custom:
  woodchuck:
    destination: "logzio"
    config: 
      token: <logzio-token>
      host: <logzio-host> # these are usually like: "listener.logz.io"
```

#### Extension Configuration

For more information on Woodchuck and configuring look at its [repo](https://www.github.com/klaatu01/woodchuck)

### Excluding functions

The `exclude` list can be used to exclude the Woodchuck layer from a function.

#### Example 

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

## Help & Community

