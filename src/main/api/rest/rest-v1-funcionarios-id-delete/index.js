/**
 * @file Controller
 * @author douglaspands
 * @since 2017-11-22
 */
'use strict';
/** 
 * Configuracoes da rota
 * @returns {object} Retorna os campos:
 * controller: tipo de api (rest|graphql)
 * method: verbo http que esta sendo executado
 * uri: rota 
 * graphql: nome do arquivo .gql
 */
module.exports.route = () => {
    return {
        controller: 'rest',
        method: 'delete',
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
module.exports.controller = async ({ params }, res, next, { get }) => {

    const service = get.self.context.module('services/funcionario-service');
    const validarEntrada = get.self.context.module('modules/validador');
    const cache = get.self.context.module('utils/cache-crud');

    const errors = validarEntrada({ _id: params.id });
    if (errors) return res.status(400).send(errors);

    try {
        const ret = await cache
                            .excluir(`get_funcionario_${params.id}`)
                            .aposMetodo(service.removerFuncionario, params.id);
        res.status(200).send({ data: ret });
    } catch (error) {
        res.status(404).send({});
    }

};