export const log = require('loglevel')

if(process.env.NODE_ENV == 'development') {
    log.setLevel('debug')
}

export function logTrace(msg: string, ...otherArgs: any[]) {
    return log.trace(msg, ...otherArgs)
}

export function logDebug(msg: string, ...otherArgs: any[]) {
    return log.debug(msg, ...otherArgs)
}

export function logInfo(msg: string, ...otherArgs: any[]) {
    return log.info(msg, ...otherArgs)
}

export function logWarn(msg: string, ...otherArgs: any[]) {
    return log.warn(`Warning: ${msg}`, ...otherArgs)
}

export function logError(msg: string, ...otherArgs: any[]) {
    return log.error(`Error: ${msg}`, ...otherArgs)
}
