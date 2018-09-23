'use strict';

const request = require('./request');
const createConnection = require('./create-connection');
const packetParserFactory = require('./packet-parser-factory');

/**
 * @param {Object} options
 * @returns {function(*=, *=): Array}
 */
module.exports = function (options) {
    options = options || {};

    /**
     * @param {Object} data
     * @param {Object} _options
     * @returns {Array}
     */
    return async function (data, _options) {
        _options = _options || {};
        let connection = await createConnection(options.connection, {
            connectionTimeout: _options.connectionTimeout || options.connectionTimeout
        });
        let packetParser = packetParserFactory(options.parser);
        let packets = await request(connection, data, packetParser, {
            waitPacketsNum: _options.waitPacketsNum || options.waitPacketsNum,
            waitTimeout: _options.waitTimeout || options.waitTimeout,
        });
        connection.end().unref();
        return packets;
    };
};
