/**
 * @file Motor de APIs em Node.js com GraphQL e MongoDB.
 * @author @douglaspands
 * @since 2017-12-26
 */
'use strict';
// Obtendo informações do servidor
const { name, version } = require('./package');
// Inicializando servidor
const app = require('express')();
// Armazenando diretorio do servidor e configurações
app.set('root', __dirname);
app.set('package', require('./package'));
// Configurando log
const logger = require('./middleware/express-log')(app);
// Executando modulos sincronamente
(async () => {
  // Incluindo middleware do Express
  require('./middleware/express-modules')(app);
  // Inicializando banco de dados
  const db = await require('./middleware/mongodb-connect')(app);
  // Registrando APIs
  const routes = await require('./middleware/express-register-routes')(app);
  return routes;
})().then(({ rest, graphql }) => {
  // Inicializando o servidor
  const server = app.listen((process.env.PORT || 3000), () => {
    // Log da inicialização do servidor
    logger.info(`Executando "${name}@${version}" em http://localhost:${server.address().port} (${(process.env.NODE_ENV || 'develop')})`);
    // Lista todas as APIs REST encontradas
    rest.forEach(route => logger.info(`REST registrado....: ${route.uri} [${route.verb}]`));
    // Lista todas as APIs GraphQL encontradas
    graphql.forEach(service => logger.info(`GraphQL registrado.: ${service}`));
  });
  // Criando health-check
  require('./middleware/health-check')(app, rest, graphql, server);
}).catch(error => {
  logger.error(error.stack);
  process.exit(1);
});
