/**
 * @file Modulo de apoio a API.
 * @author @douglaspands
 * @since 2017-12-29
 */
'use strict';
const path = require('path');
const config = require('./config');
const regexFolderLimit = new RegExp(config.folderLimit);
/**
 * Class de contexto da API
 * @class Context
 * @param {string} apiPath Diretorio da API
 * @param {object} app servidor Express 
 */
function Context(modulePath, app) {

    const _app = app;
    const _modulePath = path.join(modulePath, '..');
    const _moduleName = (_modulePath.split(/[\\\/]/g)).pop();
    const _logger = app.get('logger');

    /**
     * Obter variaveis do servidor
     * @param {string} name Nome da variavel do servidor
     * @return {any} Retornar o valor da variavel obtida.
     */
    this.getServer = name => {
        let _mod = null;
        try {
            _mod = _app.get(name);
        } catch (error) {
            _logger.error({
                source: _moduleName,
                message: error.stack
            });
        }
        return _mod;
    };
    /**
     * Obter modulos locais.
     * @param {string} name Nome do modulo
     * @param {boolean} self "true" - Executa a primeira função passando o "this".
     * @return {object} Conexão com o MongoDB
     */
    this.getModule = (name, self) => {

        if (typeof name !== 'string') return null;

        const _name = name;
        const _self = (typeof self === 'boolean') ? self : false;

        function getLocalModule(modulePath, name) {
            if (!regexFolderLimit.test(modulePath)) return null;
            try {
                return require(path.join(modulePath, name));
            } catch (error) {
                const newModulePath = path.join(modulePath, '..');
                return getLocalModule(newModulePath, name);
            }
        }

        const _mod = getLocalModule(_modulePath, _name);

        if (!_mod) {
            _logger.error({
                source: _moduleName,
                message: `Modulo "${_name}" não foi encontrado!`
            })
            return null;
        } else if (_self && typeof _mod === 'function') {
            return _mod(this);
        } else {
            return _mod;
        }

    }

    if (this instanceof Context) {
        Object.freeze(this);
    }

}

module.exports = Context;
