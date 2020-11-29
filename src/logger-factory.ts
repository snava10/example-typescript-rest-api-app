import * as log4js from "log4js";
import { Logger } from "log4js";

export class LoggerFactory {
  public static getLogger(level: string): Logger {
    log4js.configure({
      appenders: {
        std: {
          type: "stdout",
          layout: {
            type: "pattern",
            pattern: "%d %p %c %f:%l %m%n",
          },
        },
      },
      categories: {
        default: { appenders: ["std"], level: level, enableCallStack: true },
      },
    });

    const logger4 = log4js.getLogger("std");
    return logger4;
  }

  public static getLoggerFileCofig(): Logger {
    log4js.configure("src/logger/log4js.json");
    return log4js.getLogger("default");
  }
}

const logger = LoggerFactory.getLogger("debug");
export default logger;
