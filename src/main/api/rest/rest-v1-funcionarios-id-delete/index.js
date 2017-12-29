/**
 * @file Controller
 * @author douglaspands
 * @since 2017-11-22
 */
'use strict';
/**
 * @controller rest
 * @verb delete
 * @uri /v1/funcionarios/:id
 */
/**
 * Controller
 * @param {object} req Request da API
 * @param {object} res Response da API
 * @param {object} context Objeto de contexto da API
 * @return {void} 
 */
module.exports.controller = async ({ params }, res, _, { getModule }) => {

    const modelFuncionario = getModule('models/funcionario', true);
    const validarEntrada = getModule('modules/form', true);

    const errors = validarEntrada({ _id: params.id });

    if (errors) return res.status(400).send(errors);

    try {
        const ret = await modelFuncionario.removerFuncionario(params.id);
        res.status(200).send({ data: ret });
    } catch (error) {
        res.status(204).send({});
    }

};