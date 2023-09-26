/// <reference types="node" />
import { WriteStream } from 'fs';
export type LoggerLevel = 'error' | 'warn' | 'info' | 'debug';
export declare const DEFAULT_LOGGER_SEPARATOR = ":";
export declare const DEFAULT_LOGGER_LEVELS: LoggerLevel[];
export declare const DEFAULT_LOGGER_LEVEL: LoggerLevel;
export interface LoggerConfig {
    levels?: string[];
    groupSeparator?: string;
    formater?: Intl.DateTimeFormat;
}
export declare const DEFAULT_LOGGER_CONFIG: Required<LoggerConfig>;
export declare class Logger {
    private path;
    [string: string]: any;
    normalizedPath: string;
    stream: WriteStream;
    private isGroupActive;
    private groupTitle;
    private configuration;
    constructor(path: string, config?: LoggerConfig);
    defineMethods(): void;
    log(level: string, data: any): void;
    group(title?: string): void;
    closeGroup(): void;
    private printEndGroup;
    close(): void;
    private write;
    private crateSeparatorMessage;
}
