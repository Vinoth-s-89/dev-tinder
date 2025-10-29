const cron = require("node-cron");

cron.schedule(
  "1,2,3,4,5 * * * * *",
  () => {
    console.log("Running Jobs At", new Date().toLocaleTimeString());
  },
  {
    maxExecutions: 3,
  }
);
