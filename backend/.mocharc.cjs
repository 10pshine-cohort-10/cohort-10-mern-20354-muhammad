module.exports = {
  spec: 'test/**/*.test.js',
  recursive: true,
  timeout: 5000,
  require: ['./test/helpers/setupEnv.js'],
};
