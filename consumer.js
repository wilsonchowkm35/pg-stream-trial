'use strict';
require('dotenv').config();
const insepct = require('util').inspect;
const { LogicalReplicationService, Wal2JsonPlugin } = require("pg-logical-replication");
console.log("host", process.env.DB_HOST)
function createLogicalReplicationService() {
  return new LogicalReplicationService({
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
  }, {
    acknowledge: true,
    timeoutSeconds: 10,
  });
}
const logicalReplicationService = createLogicalReplicationService();
const plugin = new Wal2JsonPlugin();

function subscribe(logicalReplicationService) {
  console.log("SLOT", process.env.SLOT)
  logicalReplicationService.subscribe(plugin, process.env.SLOT).catch(error => {
    console.error("Error: ", error);
  }).then(() => {
    console.log("Subscribed");
    setTimeout(subscribe, 100);
  });
}

(async () => {
  const result = [];
  logicalReplicationService.on('data', (lsn, log) => {
    console.log("LSN: ", lsn);
    console.log("LOG: ", insepct(log, { depth: 10 }));
    result.push({ lsn, log });
  });

  logicalReplicationService.on('error', error => {
    console.error("Event Error: ", error);
  });

  logicalReplicationService.on('start', () => {
    console.log("Streaming Start");
  });

  logicalReplicationService.on('acknowledge', () => {
    console.log("event acknowledge");
  });

  subscribe(logicalReplicationService);

  // await new Promise(resolve => setTimeout(resolve, 10 * 1000));
  
})();
