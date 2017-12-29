/**
 * @file Registrando rotas no Express
 * @author @douglaspands
 * @since 2017-12-28
 */
'use strict';
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const config = require('./config');
const Context = require('../context-app');
const searchFiles = require('../search-files');
const searchController = require('../search-controllers');

const router = require('express').Router();
const { buildSchema } = require('graphql');
const graphqlHTTP = require('express-graphql');
const { mergeTypes } = require('merge-graphql-schemas');

const registerRoutes = async app => {

    const logger = app.get('logger');
    const { graphqlSchemaIsValid, duplicateFunctions } = require('./utils')(logger);

    const files = searchFiles(path.join(app.get('root'), config.directory));
    const routes = searchController(files);

    const restList = routes.filter(route => route.controller === 'rest');
    restList.forEach(route => {
        const api = require(route.file);
        const context = new Context(path.join(route.file, '..'), app);
        const listHandlers = (Object.keys(api)).reduce((handlers, fn) => {
            function createHandler() {
                function handler() {
                    let args = Array.prototype.slice.call(arguments);
                    args.push(context);
                    api[fn].apply(this, args);
                }
                return handler;
            }
            handlers.push(new createHandler());
            return handlers;
        }, []);
        try {
            router[route.verb](route.uri, listHandlers);
        } catch (error) {
            logger.error({
                source: config.source,
                message: error
            });
        }
    });
    if (restList.length > 0) app.use('/', router);

    let root = {};
    let schemas = [];
    const graphqlList = routes.filter(route => route.controller === 'graphql');
    graphqlList.forEach(route => {
        try {
            const resolverFunction = require(route.file)(new Context(path.join(route.file, '..'), app));
            const stringSchema = fs.readFileSync(route.graphql, 'utf8');
            if (graphqlSchemaIsValid(stringSchema) && !duplicateFunctions(root, resolverFunction)) {
                Object.assign(root, resolverFunction);
                schemas.push(stringSchema);
            } else {
                logger.error({
                    source: config.source,
                    message: `function.: ${route.file}`
                });
                logger.error({
                    source: config.source,
                    message: `schema...: ${route.graphql}`
                });
            }
        } catch (error) {
            logger.error({
                source: config.source,
                message: error.stack
            });
        }
    });
    if (!_.isEmpty(root) && schemas.length > 0) {
        let graphqlServer = null;
        try {
            const schemaMerge = mergeTypes(schemas);
            const schemaBin = buildSchema(schemaMerge);
            graphqlServer = graphqlHTTP({
                schema: schemaBin,
                rootValue: root,
                graphiql: (process.env.NODE_ENV !== 'production')
            });
        } catch (error) {
            logger.error({
                source: config.source,
                message: error.stack
            });
            root = {};
        }
        if (graphqlServer) app.use('/graphql', graphqlServer);
    }

    return {
        rest: restList,
        graphql: Object.keys(root)
    };

}

module.exports = registerRoutes;