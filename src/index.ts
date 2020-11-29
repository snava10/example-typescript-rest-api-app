"use strict";

import logger from "./logger-factory";
import { start } from "./start";

start().catch((err) => {
  logger.error(`Error starting server: ${err.message}`);
  process.exit(-1);
});
