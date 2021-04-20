const fs = require('fs');
const { FluentBundle, FluentResource } = require('@fluent/bundle');

let resource = new FluentResource(fs.readFileSync('./strings.ftl', { encoding: 'utf8' }));
let bundle = new FluentBundle('en-US');
let errors = bundle.addResource(resource);
if (errors.length) {
  console.error('Errors while processing strings file');
  for (const error of errors.length) {
    console.error(error);
  }
  process.exit(1);
}

module.exports = function ftl(messageId, vars = {}) {
  const message = bundle.getMessage(messageId);
  if (!message) {
    throw new Error(`Could not find the message "${messageId}"`);
  }

  const requiredVars = new Set();

  for (const item of message.value) {
    if (item.type == 'var') {
      requiredVars.add(item.name);
    }
    if (item.type == 'select') {
      for (const variant of item.variants) {
        for (const variantItem of variant.value) {
          if (variantItem.type == 'var') {
            requiredVars.add(variantItem.name);
          }
        }
      }
    }
  }

  for (const variable of Object.keys(vars)) {
    requiredVars.delete(variable);
  }
  if (requiredVars.size) {
    throw new Error(
      `Not all required variables were provided for the message "${messageId}". ` +
        `Missing: ${Array.from(requiredVars)
          .map((v) => `"${v}"`)
          .join(', ')}`,
    );
  }

  const formatted = bundle.formatPattern(message.value, vars);
  return stripFluentSpecialChars(formatted);
};

let stripFluentSpecialChars = (string) => {
  return string.replace(/(\u2068|\u2069)/g, '');
};
