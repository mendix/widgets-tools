const path = require('path');

module.exports = {
    process(src, filePath) {
        if (path.extname(filePath) !== '.svg') {
            return src;
        }

        const name = `svg-${path.basename(filePath, '.svg')}`
            .split(/\W+/)
            .map((x) => `${x.charAt(0).toUpperCase()}${x.slice(1)}`)
            .join('');

        return {
            code: `
const jsxRuntime = require('react/jsx-runtime');
function ${name}(props) {
  return jsxRuntime.jsx(
    'svg',
    Object.assign({}, props, {'data-file-name': ${name}.name})
  );
}
module.exports = ${name};
`
        };
    },
};
