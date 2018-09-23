'use strict';

const createConnection = require('./create-connection');
const packetParserFactory = require('./packet-parser-factory');
const request = require('./request');

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
        let connection = await createConnection(options.connection, _options.connectionTimeout || _options.connectionTimeout);
        let packetParser = packetParserFactory(options.parser);
        let packets = await request(
            connection,
            data,
            packetParser,
            _options.waitPacketsNum || options.waitPacketsNum,
            _options.waitTimeout || options.waitTimeout
        );
        connection.end().unref();
        return packets;
    };
};
