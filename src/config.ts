
const config: any = {
    HOME_ROUTE: '/',
    GET_TOKEN_PATH: '/auth',
    DATE_FORMAT: 'YYYY-MM-DD',
    TOKEN_RENEW_ENABLE: true,
    TOKEN_RENEW_THRESHOLD: 300,
    TOKEN_RENEW_PATH: '/auth/renew',
    TOKEN_RENEW_EXEMPT_PATHS: ['/auth', '/auth/renew'],
    DEFAULT_RESOURCES: {} as any
}

export default config

/**
 * Get any config value using dot notation
 * @param key 
 * @param defaultValue 
 * @param context 
 */
export function getConfig(key: string, defaultValue?: any, context: any = config): any {
    let parts = key.split('.')
    let part = parts.shift()
    if(parts.length > 0) {
        return getConfig(parts.join('.'), defaultValue, context[part])
    }
    return ('undefined' !== typeof context[part]) ? context[part] : defaultValue
}

export function setConfig(key: string, value: any) {
    let parts = key.split('.')
    let part = parts.pop()
    if(parts.length > 0) {
        let context = getConfig(parts.join())
        return context[part] = value
    } else {
        return config[part] = value
    }
}
