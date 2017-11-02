/**
 * @file Validar parametros de entrada.
 * @author @douglaspands
 * @since 2017-11-01
 */
'use strict';
const _ = require('lodash');
const Erro = require('../../utils/formError');
/**
 * Validar parametros de entrada.
 * @param {object} req Objeto com parametros de entrada.
 * @return {Array.<Object>}
 */
function validator (req) {
    
    let errors = [];

    if (!_.isString(req.params.id) || !(/^[0-9]+$/g).test(req.params.id)) {
        errors.push(new Erro('id', req.params.id, 'Campo preenchido com caracteres não numericos.'));
    }

    return errors;

}
module.exports = validator;