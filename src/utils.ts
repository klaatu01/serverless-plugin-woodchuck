import yaml from "yaml-ast-parser"
import fs from "fs"
import os from 'os';
import _ from "lodash"

const findKeyChain = (astContent) => {
  let content = astContent;
  const chain = [content.key.value];
  while (content.parent) {
    content = content.parent;
    if (content.key) {
      chain.push(content.key.value);
    }
  }
  return chain.reverse().join('.');
};

const parseAST = (ymlAstContent, astObject = null) => {
  let newAstObject = astObject || {};
  if (ymlAstContent.mappings && Array.isArray(ymlAstContent.mappings)) {
    ymlAstContent.mappings.forEach((v) => {
      if (!v.value) {
        return;
      }

      if (v.key.kind === 0 && v.value.kind === 0) {
        newAstObject[findKeyChain(v)] = v.value;
      } else if (v.key.kind === 0 && (v.value.kind === 2 || v.value.kind === 3)) {
        newAstObject[findKeyChain(v)] = v.value;
        newAstObject = parseAST(v.value, newAstObject);
      }
    });
  } else if (ymlAstContent.items && Array.isArray(ymlAstContent.items)) {
    ymlAstContent.items.forEach((v, i) => {
      if (v.kind === 0) {
        const key = `${findKeyChain(ymlAstContent.parent)}[${i}]`;
        newAstObject[key] = v;
      }
    });
  }

  return newAstObject;
};

const constructPlainObject = (ymlAstContent, branchObject = null) => {
  const newbranchObject = branchObject || {};
  if (ymlAstContent.mappings && Array.isArray(ymlAstContent.mappings)) {
    ymlAstContent.mappings.forEach((v) => {
      if (!v.value) {
        // no need to log twice, parseAST will log errors
        return;
      }

      if (v.key.kind === 0 && v.value.kind === 0) {
        newbranchObject[v.key.value] = v.value.value;
      } else if (v.key.kind === 0 && v.value.kind === 2) {
        newbranchObject[v.key.value] = constructPlainObject(v.value, {});
      } else if (v.key.kind === 0 && v.value.kind === 3) {
        const plainArray = [];
        v.value.items.forEach((c) => {
          plainArray.push(c.value);
        });
        newbranchObject[v.key.value] = plainArray;
      }
    });
  }

  return newbranchObject;
};

const addNewObject = (ymlFile, pathInYml, newValue) => {
  let yamlContent = fs.readFileSync(ymlFile, 'utf8')
  const rawAstObject = yaml.load(yamlContent);
  const astObject = parseAST(rawAstObject);
  const plainObject = constructPlainObject(rawAstObject);
  const pathInYmlArray = pathInYml.split('.');

  let currentNode = plainObject;
  for (let i = 0; i < pathInYmlArray.length - 1; i++) {
    const propertyName = pathInYmlArray[i];
    const property = currentNode[propertyName];
    if (!property || _.isObject(property)) {
      currentNode[propertyName] = property || {};
      currentNode = currentNode[propertyName];
    } else {
      throw new Error(`${property} can only be undefined or an object!`);
    }
  }

  const propertyName = _.last(pathInYmlArray) as string;
  let property = currentNode[propertyName];
  if (!property || _.isObject(property)) {
    property = property || {};
  } else {
    throw new Error(`${propertyName} can only be undefined or an array!`);
  }
  currentNode[propertyName] = _.union(propertyName, [newValue]);

  const branchToReplaceName = pathInYmlArray[0];
  const newObject = {};
  newObject[branchToReplaceName] = plainObject[branchToReplaceName];
  const newText = yaml.dump(newObject, null);
  if (astObject[branchToReplaceName]) {
    const beginning = yamlContent.substring(
      0,
      astObject[branchToReplaceName].parent.key.startPosition
    );
    const end = yamlContent.substring(
      astObject[branchToReplaceName].endPosition,
      yamlContent.length
    );
    return fs.writeFileSync(ymlFile, `${beginning}${newText}${end}`);
  }
  return fs.writeFileSync(ymlFile, `${yamlContent}${os.EOL}${newText}`);
};


export {
  addNewObject
};
