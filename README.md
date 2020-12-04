# serverless-plugin-woodchuck
[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)

Serverless plugin for ~zero-config log forwarding

## Features

* Zero-config: Works out of the box without any extra configuration, by getting the 'default' version of Woodchuck for your region.

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

## Configure

For more information on Woodchuck and configuring look at its [repo](www.github.com/klaatu01/woodchuck)

All keys below are optional. 
```yaml
custom:
  woodchuck:
    maxItems: 1000 # (100-10000)
    maxBytes: 262144 # (262144-1048576)
    timeout: 5000 # (100-30000)
    port: 1060
```

### Destinations

Required Environment varibles for each destination are below:

#### Loggly

```yaml
environment:
  LOGGLY_TOKEN: <loggly-token>
  LOGGLY_TAG: <loggly-tag>
```

## Help & Community

