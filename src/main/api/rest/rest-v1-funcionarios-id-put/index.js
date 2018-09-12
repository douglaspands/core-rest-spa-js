/**
 * @file Controller
 * @author douglaspands
 * @since 2017-11-22
 */
'use strict';
/** 
 * Configuracoes da rota
 * @returns {object} Retorna os campos:
 * controller: tipo de api (rest:graphql)
 * method: verbo http que esta sendo executado
 * uri: rota 
 * graphql: nome do arquivo .gql
 */
module.exports.route = () => {
    return {
        controller: 'rest',
        method: 'put',
        uri: '/v1/funcionarios/:id'
    }
};
/**
 * Controller
 * @param {object} req Request da API
 * @param {object} res Response da API
 * @param {object} context Objeto de contexto da API
 * @return {void} 
 */
module.exports.controller = async ({ params, body }, res, next, { get }) => {

    const service = get.self.context.module('services/funcionario-service');
    const validarEntrada = get.self.context.module('modules/validador');
    const cache = get.self.context.module('utils/cache-crud');

    let input = body;
    input._id = params.id;
    const errors = validarEntrada(input);

    if (errors) return res.status(400).send(errors);

    try {
        const ret = await cache
                            .set(`api:funcionarios:${params._id}`)
                            .withResultOfMethod(service.atualizarFuncionario, [ input._id, body ])
                            .expireOn(3600);
        return res.status(200).send({ data: ret });
    } catch (error) {
        return res.status(404).send({});
    }

};