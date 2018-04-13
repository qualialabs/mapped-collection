Package.describe({
  name: 'qualia:mapped-collection',
  version: '0.0.1',
  summary: 'Map Mongo collections into memory for fast search',
  git: 'https://github.com/qualialabs/mapped-collection',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@1.4');

  api.use([
    'ecmascript',
    'underscore',
  ], ['server']);

  api.mainModule('server/main.js', 'server');

});
