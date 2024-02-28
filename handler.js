'use strict';
const { LogicalReplicationService, Wal2JsonPlugin } = require("pg-logical-replication");

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

module.exports.handler = async event => {

  const result = [];
  logicalReplicationService.on('data', (lsn, log) => {
    console.log("LSN: ", lsn);
    console.log("LOG: ", log);
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

  await new Promise(resolve => setTimeout(resolve, 10 * 1000));
  
  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};
