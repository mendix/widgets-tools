function beforePacking(pkg) {
  // Remove bundled dependency from published package
  delete pkg.dependencies['@mendix/widget-typings-generator'];

  console.log('✓ Removed bundled dependency from package.json');

  return pkg;
}

module.exports = {
  hooks: {
    beforePacking
  }
};
