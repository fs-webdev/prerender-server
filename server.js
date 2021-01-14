#!/usr/bin/env node
var prerender = require('./lib');

var server = prerender({  
    logRequests: true,
    // pageDoneCheckInterval: 10000,
    pageLoadTimeout: 5 * 1000
});

// server.use(prerender.sendPrerenderHeader());
server.use(prerender.blockResources());
server.use(prerender.removeScriptTags());
server.use(prerender.httpHeaders());

server.start();
