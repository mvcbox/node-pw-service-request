'use strict';

const net = require('net');
const WaitTimeoutError = require('./errors/WaitTimeoutError');
const ConnectionLostError = require('./errors/ConnectionLostError');

/**
 * @param {net.Socket} connection
 * @param {Buffer} data
 * @param {Function} packetParser
 * @param {number} waitPacketsNum
 * @returns {Promise<Array>}
 */
module.exports = function (connection, data, packetParser, waitPacketsNum, waitTimeout) {
    return new Promise(function (resolve, reject) {
        let timeoutId = setTimeout(function () {
            connection.removeAllListeners();
            connection.end().unref();
            reject(new WaitTimeoutError(`WaitTimeoutError: ${waitTimeout || 30000}ms`));
        }, waitTimeout || 30000);

        let result = [];
        connection.write(data);

        connection.on('error', function (err) {
            clearTimeout(timeoutId);
            connection.removeAllListeners();
            reject(err);
        });

        connection.on('close', function () {
            clearTimeout(timeoutId);
            connection.removeAllListeners();
            reject(new ConnectionLostError('Connection lost'));
        });

        connection.on('data', function (chunk) {
            result = result.concat(packetParser(chunk));

            if (result.length >= (waitPacketsNum || 1)) {
                clearTimeout(timeoutId);
                connection.removeAllListeners();
                resolve(result);
            }
        });
    });
};
