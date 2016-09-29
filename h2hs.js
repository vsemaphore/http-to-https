"use strict";

const cli = require('cli');
const http = require('http');
const https = require('https');

cli.parse({
    port: ['p', 'Port to listen on', 'number', 8080],
    host: ['h', 'Host ot listen on', 'string', '127.0.0.1']
});

cli.main((args, options) => {
    const server = http.createServer((request, response) => {
        var url = request.url.substr(1);
        var msg = `[${new Date()}, ${request.connection.remoteAddress}, ${url}]`;

        if( ! /^https:/i.test(url)) {
            console.warn(msg, 'Non HTTPS endpoint');
            response.statusCode = 400;
            return response.end('Non HTTPS endpoint');
        }

        console.log(msg, 'Loading website');

        https.get(url, (res) => {
            console.log('statusCode:', res.statusCode);
            response.statusCode = res.statusCode;

            for(let header in res.headers) {
                response.setHeader(header, res.headers[header]);
            }

            res.on('data', (d) => {
                response.write(d);
            });

            res.on('end', () => {
                console.log(msg, 'res.End');
                response.end();
            })

        }).on('error', (e) => {
            console.error(msg, e);
            response.statusCode = 500;
            response.end(e.toString());
        });
    });

    server.listen(options.port, options.host, () => {
        console.log(`h2hs running at http://${options.host}:${options.port}/`);
    });

});

