import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { buildArn, getCompatibleLayerVersions, getLatestLayer, layerVersions } from "../src/layers"

test('buildArn', () => {
  const destination = "loggly"
  const region = "eu-west-1"
  const arch = "x86_64"
  const version = 23
  const accountId = "000000000000"
  const preBuiltArn = "arn:aws:lambda:eu-west-1:000000000000:layer:woodchuck_loggly_x86_64:23"

  const arn = buildArn(destination, accountId, region, arch, version)

  assert.equal(arn, preBuiltArn)
})

test('getLatestLayerVersion', () => {
  const destination = "loggly"
  const region = "eu-west-1"
  const arch = "x86_64"

  const layer = getLatestLayer(destination, region, arch)

  assert.equal(layer.version, 4)
})

test('getCompatibleLayerVersions', () => {
  const destination = "loggly"
  const region = "eu-west-1"
  const arch = "x86_64"

  const layers = getCompatibleLayerVersions(destination, region, arch)

  assert.equal(layers.length, 2)
})

test.run()
