import { createWriteStream, WriteStream, existsSync, rmSync } from 'fs';
import { normalize } from 'path';

export type LoggerLevel = 'error' | 'warn' | 'info' | 'debug';

export const DEFAULT_LOGGER_SEPARATOR = ':';
export const DEFAULT_LOGGER_LEVELS: LoggerLevel[] = ['debug', 'info', 'error', 'warn'];
export const DEFAULT_LOGGER_LEVEL: LoggerLevel = 'info';

const FORMAT_OPTIONS = {
  timeZone: 'America/Bogota',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  fractionalSecondDigits: 3,
};
const DEFAULT_TIME_FORMATER: Intl.DateTimeFormat = new Intl.DateTimeFormat(
  'es-CO',
  FORMAT_OPTIONS as unknown as Intl.DateTimeFormatOptions
);

export interface LoggerConfig {
  levels?: string[];
  groupSeparator?: string;
  formater?: Intl.DateTimeFormat;
}

export const DEFAULT_LOGGER_CONFIG: Required<LoggerConfig> = {
  groupSeparator: DEFAULT_LOGGER_SEPARATOR,
  levels: DEFAULT_LOGGER_LEVELS,
  formater: DEFAULT_TIME_FORMATER,
};

export class Logger {
  [string: string]: any;
  normalizedPath: string;
  stream: WriteStream;
  private isGroupActive = false;
  private groupTitle = '';
  private configuration: Required<LoggerConfig>;
  constructor(private path: string, config: LoggerConfig = DEFAULT_LOGGER_CONFIG) {
    let formater;
    let groupSeparator;
    let levels;
    if (config) {
      if (config.formater) {
        formater = config.formater;
      } else {
        formater = DEFAULT_TIME_FORMATER;
      }
      if (config.groupSeparator) {
        groupSeparator = config.groupSeparator;
      } else {
        groupSeparator = DEFAULT_LOGGER_SEPARATOR;
      }
      if (config.levels && config.levels.length > 0) {
        levels = config.levels;
      } else {
        levels = DEFAULT_LOGGER_LEVELS;
      }

      this.configuration = {
        formater,
        groupSeparator,
        levels,
      };
    } else {
      this.configuration = DEFAULT_LOGGER_CONFIG;
    }

    this.defineMethods();
    this.normalizedPath = normalize(this.path);
    if (existsSync(this.normalizedPath)) {
      rmSync(this.normalizedPath);
    }

    this.stream = createWriteStream(this.normalizedPath, {
      flags: 'a',
      encoding: 'utf8',
      mode: 0x666,
    });
  }

  defineMethods() {
    for (const level of this.configuration.levels) {
      (this as any)[level] = (data: any) => {
        this.log(level, data);
      };
    }
  }
  log(level: string, data: any) {
    const date = new Date();

    const formatedDate = this.configuration.formater.format(date);
    let l = this.configuration.levels[0];
    if (this.configuration.levels.includes(level)) {
      l = level;
    }
    l = l.toUpperCase();
    let convertedData = data;
    let message: string = [l, ' [', formatedDate, '] ', convertedData].join('');
    if (typeof data === 'object') {
      convertedData = JSON.stringify(data, null, 2);
      message = [l, ' [', formatedDate, '] ', '\n', convertedData].join('');
    }
    if (this.isGroupActive) {
      const fragments = message.split('\n');
      message = '';
      for (const fragment of fragments) {
        message += '\t' + fragment + '\n';
      }
    } else {
      message = message + '\n';
    }
    this.write(message);
  }

  group(title: string = '') {
    if (this.isGroupActive) {
      this.printEndGroup();
    }
    this.groupTitle = title;
    const separator = this.crateSeparatorMessage(this.groupTitle);
    this.isGroupActive = true;
    this.write('\n' + separator);
  }

  closeGroup() {
    if (this.isGroupActive) {
      this.printEndGroup();
    }
  }
  private printEndGroup() {
    const separator = this.crateSeparatorMessage(this.groupTitle);
    this.isGroupActive = false;
    this.write(separator + '\n');
  }

  close() {
    if (this.isGroupActive) {
      this.printEndGroup();
    }

    this.stream.close();
  }
  private write(mesage: string) {
    this.stream.write(mesage);
  }

  private crateSeparatorMessage(title: string) {
    const width = 80;
    const titleLength = title.length;
    const spacerLength = 2;
    const paddingLeft = (width - titleLength - spacerLength) / 2;
    const arrayRef = Array.from({ length: paddingLeft });
    const padding = arrayRef.map(() => this.configuration.groupSeparator).join('');
    return padding + ' ' + title + ' ' + padding + '\n';
  }
}
