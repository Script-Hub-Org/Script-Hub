const scriptMap = {
  './script-hub.js': /^https?:\/\/script\.hub\/($|edit\/|reload)/,
  './Rewrite-Parser.js':
    /^https?:\/\/script\.hub\/file\/_start_\/.+type=(qx-rewrite|loon-plugin|surge-module|all-module)/,
  './rule-parser.js': /^https?:\/\/script\.hub\/file\/_start_\/.+type=rule-set/,
  './script-converter.js': /^https?:\/\/script\.hub\/convert\//,
}
const scriptMapBeta = {
  './script-hub.beta.js': /^https?:\/\/script\.hub\/($|edit\/|reload)/,
  './Rewrite-Parser.beta.js':
    /^https?:\/\/script\.hub\/file\/_start_\/.+type=(qx-rewrite|loon-plugin|surge-module|all-module)/,
  './rule-parser.beta.js': /^https?:\/\/script\.hub\/file\/_start_\/.+type=rule-set/,
  './script-converter.beta.js': /^https?:\/\/script\.hub\/convert\//,
}

module.exports = {
  scriptMap,
  scriptMapBeta,
}
