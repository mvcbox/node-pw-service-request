'use strict';

const net = require('net');
const ConnectionTimeoutError = require('./errors/ConnectionTimeoutError');

/**
 * @param {object} connectOptions
 * @param {number} connectionTimeout
 * @returns {Promise<net.Socket>}
 */
module.exports = function (connectOptions, connectionTimeout) {
    return new Promise(function (resolve, reject) {
        let connection = net.createConnection(connectOptions);
        let timeoutId = setTimeout(function () {
            connection.removeAllListeners();
            connection.end().unref();
            reject(new ConnectionTimeoutError(`ConnectionTimeoutError: ${connectionTimeout || 10000}ms`));
        }, connectionTimeout || 10000);

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
