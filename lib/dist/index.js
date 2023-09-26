"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.DEFAULT_LOGGER_CONFIG = exports.DEFAULT_LOGGER_LEVEL = exports.DEFAULT_LOGGER_LEVELS = exports.DEFAULT_LOGGER_SEPARATOR = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
exports.DEFAULT_LOGGER_SEPARATOR = ':';
exports.DEFAULT_LOGGER_LEVELS = ['debug', 'info', 'error', 'warn'];
exports.DEFAULT_LOGGER_LEVEL = 'info';
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
const DEFAULT_TIME_FORMATER = new Intl.DateTimeFormat('es-CO', FORMAT_OPTIONS);
exports.DEFAULT_LOGGER_CONFIG = {
    groupSeparator: exports.DEFAULT_LOGGER_SEPARATOR,
    levels: exports.DEFAULT_LOGGER_LEVELS,
    formater: DEFAULT_TIME_FORMATER,
};
class Logger {
    constructor(path, config = exports.DEFAULT_LOGGER_CONFIG) {
        this.path = path;
        this.isGroupActive = false;
        this.groupTitle = '';
        let formater;
        let groupSeparator;
        let levels;
        if (config) {
            if (config.formater) {
                formater = config.formater;
            }
            else {
                formater = DEFAULT_TIME_FORMATER;
            }
            if (config.groupSeparator) {
                groupSeparator = config.groupSeparator;
            }
            else {
                groupSeparator = exports.DEFAULT_LOGGER_SEPARATOR;
            }
            if (config.levels && config.levels.length > 0) {
                levels = config.levels;
            }
            else {
                levels = exports.DEFAULT_LOGGER_LEVELS;
            }
            this.configuration = {
                formater,
                groupSeparator,
                levels,
            };
        }
        else {
            this.configuration = exports.DEFAULT_LOGGER_CONFIG;
        }
        this.normalizedPath = (0, path_1.normalize)(this.path);
        if ((0, fs_1.existsSync)(this.normalizedPath)) {
            (0, fs_1.rmSync)(this.normalizedPath);
        }
        this.stream = (0, fs_1.createWriteStream)(this.normalizedPath, {
            flags: 'a',
            encoding: 'utf8',
            mode: 0x666,
        });
    }
    log(level, data) {
        const date = new Date();
        const formatedDate = this.configuration.formater.format(date);
        let l = this.configuration.levels[0];
        if (this.configuration.levels.includes(level)) {
            l = level;
        }
        l = l.toUpperCase();
        let convertedData = data;
        let message = [l, ' [', formatedDate, '] ', convertedData].join('');
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
        }
        else {
            message = message + '\n';
        }
        this.write(message);
    }
    group(title = '') {
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
    printEndGroup() {
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
    write(mesage) {
        this.stream.write(mesage);
    }
    crateSeparatorMessage(title) {
        const width = 80;
        const titleLength = title.length;
        const spacerLength = 2;
        const paddingLeft = (width - titleLength - spacerLength) / 2;
        const arrayRef = Array.from({ length: paddingLeft });
        const padding = arrayRef.map(() => this.configuration.groupSeparator).join('');
        return padding + ' ' + title + ' ' + padding + '\n';
    }
}
exports.Logger = Logger;
//# sourceMappingURL=index.js.map