type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  timestamp: string;
  message: string;
  data?: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  private formatMessage(
    level: LogLevel,
    message: string,
    data?: unknown
  ): LogEntry {
    return {
      level,
      timestamp: new Date().toISOString(),
      message,
      data,
    };
  }

  debug(message: string, data?: unknown) {
    if (this.isDevelopment) {
      const entry = this.formatMessage("debug", message, data);
      console.debug(entry);
    }
  }

  info(message: string, data?: unknown) {
    const entry = this.formatMessage("info", message, data);
    console.log(entry);
  }

  warn(message: string, data?: unknown) {
    const entry = this.formatMessage("warn", message, data);
    console.warn(entry);
  }

  error(message: string, data?: unknown) {
    const entry = this.formatMessage("error", message, data);
    console.error(entry);
  }
}

export const logger = new Logger();
