function fn() {
  const env = karate.env || 'demo';
  const config = {
    baseUrl: 'https://petstore.swagger.io/v2',
  };
  if (env === 'local') {
    config.baseUrl = karate.properties['api.baseUrl'] || config.baseUrl;
  }
  return config;
}
