'use strict';

const net = require('net');
const ConnectionTimeoutError = require('./errors/ConnectionTimeoutError');

/**
 * @param {object} connectOptions
 * @param {Object} options
 * @returns {Promise<net.Socket>}
 */
module.exports = function (connectOptions, options) {
    options = options || {};

    return new Promise(function (resolve, reject) {
        let connection = net.createConnection(connectOptions);
        let timeoutId = setTimeout(function () {
            connection.removeAllListeners();
            connection.end().unref();
            reject(new ConnectionTimeoutError(`ConnectionTimeoutError: ${options.connectionTimeout || 1000}ms`));
        }, options.connectionTimeout || 1000);

        connection.on('connect', function () {
            clearTimeout(timeoutId);
            resolve(connection.removeAllListeners());
        });

        connection.on('error', function (err) {
            clearTimeout(timeoutId);
            connection.removeAllListeners();
            reject(err);
        });
    });
};
