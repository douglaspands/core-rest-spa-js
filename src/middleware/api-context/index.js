/**
 * @file Modulo de apoio a API.
 * @author @douglaspands
 * @since 2018-09-08
 * @version 2.1.20180921
 */
'use strict';
const path = require('path');
const utils = require('../utils');
const config = utils.getYaml('config.yaml');
const REGEX = new RegExp('(?!\\()([\\w\\-\\/\\.]+)(?=\\:\\d+\\:\\d+\\))', 'g');
const callerfolder = path.join(((new Error()).stack.toString()).match(REGEX)[1], '..');
const regexFolderLimit = new RegExp(config.folderLimit);
/**
 * Class de contexto da API
 * @class Context
 * @param {string} apiPath Diretorio da API
 * @param {object} app servidor Express 
 */
function Context(modulePath, app) {

    if (!(this instanceof Context)) {
        throw new Error('Class Context não foi instanciada!');
    }

    const _app = app;
    const _modulePath = path.join(modulePath, '..');
    const _moduleName = (_modulePath.split(/[\\\/]/g)).pop();
    const _logger = app.get('logger');

    /**
     * Encapsulando em paradigmas funcionais
     */
    this.get = {
        self: {
            context: {
                module: (moduleName) => {
                    return getModule(moduleName, this);
                }
            },
            module: (moduleName) => {
                return getModule(moduleName, null);
            }
        },
        server: (moduleName) => {
            return getServer(moduleName);
        },
        module: (moduleName) => {
            _logger.debug({
                source: _moduleName,
                message: `Foi solicitado o modulo "${moduleName}" do node_modules.`
            });
            return require(moduleName);
        }
    }

    /**
     * Modulo de log
     */
    this.logger = _logger;

    /**
     * Obter variaveis do servidor
     * @param {string} name Nome da variavel do servidor
     * @return {any} Retornar o valor da variavel obtida.
     */
    function getServer(name) {
        _logger.debug({
            source: _moduleName,
            message: `Foi solicitado a variavel "${name}" do servidor.`
        });
        const _mod = _app.get(name);
        if (!_mod) {
            _logger.error({
                source: _moduleName,
                message: `Modulo "${name}" do servidor não foi encontrada!`
            });
        }
        return _mod;
    };

    /**
     * Obter modulos locais.
     * @param {string} name Nome do modulo
     * @param {object} self "true" - Executa a primeira função passando o "this".
     * @return {object} Conexão com o MongoDB
     */
    function getModule(name, self) {

        _logger.debug({
            source: _moduleName,
            message: `Foi solicitado o modulo "${name}".`
        });

        if (typeof name !== 'string') return null;

        const _name = name;
        const _self = (self) ? self : null;

        function getLocalModule(modulePath, name) {
            if (!regexFolderLimit.test(modulePath)) return null;
            try {
                return require(path.join(modulePath, name));
            } catch (error) {
                const newModulePath = path.join(modulePath, '..');
                return getLocalModule(newModulePath, name);
            }
        }

        let _mod = getLocalModule(_modulePath, _name);

        if (_mod) {
            if (_self && (typeof _mod === 'function')) {
                _mod = _mod(_self);
            }
        } else {
            _logger.error({
                source: _moduleName,
                message: `Modulo "${_name}" não foi encontrado!`
            });
        }

        return _mod;

    }

    if (this instanceof Context) {
        Object.freeze(this);
    }

}

module.exports = Context;