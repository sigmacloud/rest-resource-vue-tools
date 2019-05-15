import Vue from 'vue'
import { parse } from 'url'
import { ResourceLike, ResourceClassLike } from 'rest-resource'
import { ValidationError } from 'rest-resource/src/exceptions'
import { JWTBearerClient, ResourceResponse, ExtractorFunction, AxiosError, AxiosResponse, RequestConfig } from 'rest-resource/src/client'
import { logDebug } from '../logger'

// Custom client
export class Client extends JWTBearerClient {
    static TOKEN_RENEW_ENABLE = true
    static TOKEN_RENEW_PATH = '/auth/renew'
    static TOKEN_RENEW_THRESHOLD = 300
    static PATH_PASSTHROUGH = ['/auth', '/auth/renew']
    refreshingUserToken: boolean = false

    constructor(baseURL: string, token: string = '', options: RequestConfig = {}) {
        super(baseURL, token, options)
        // This is a simple interceptor to renew token if it's about to expire
        this.axios.interceptors.request.use((request) => {
            if(!Client.TOKEN_RENEW_ENABLE || Client.PATH_PASSTHROUGH.indexOf(request.url) > -1 ) {
                return request
            }
            // If the token is valid but is about to expire, renew token, then continue with request
            if(this.tokenWillNeedRenewingSoon() && !this.tokenIsExpired() && !this.refreshingUserToken) {
                // Renew token
                logDebug('Refreshing user token')
                return this.renewToken().then(() => {
                    logDebug('Refreshed user token')
                    return request
                })
            } else {
                return request
            }
        })
    }

    negotiateContent(ResourceClass: ResourceClassLike): ExtractorFunction {
        // Should always return a function
        return (response: ResourceResponse['response']) => {
            let resources: ResourceLike[] = []
            const body: any = response.data
            // Django's body is paginated so we use body.results
            if (body && body.results) {
                // It's paginated
                body.results.forEach((attrs: any) => {
                    resources.push(<ResourceLike>new ResourceClass(attrs))
                })

                let result = {
                    response,
                    resources,
                } as ResourceResponse

                let perPage = ResourceClass.perPage
                let nextPage = Number(parse(body.next || '', true).query['page'] || '')
                let currentPage = nextPage - 1

                if (!perPage && currentPage == 1) {
                    // If we know we're on page 1, auto-adjust perPage property on resource's constructor
                    ResourceClass.perPage = perPage = body.results.length
                }

                if (perPage) {
                    let count = body.count
                    let pages = Math.ceil(count / perPage)
                    result.pages = () => pages
                    result.count = () => count
                    result.currentPage = () => currentPage
                    result.perPage = () => perPage
                }

                return result
            } else {
                return {
                    response,
                    resources: <ResourceLike[]>[new ResourceClass(body)],
                } as ResourceResponse
            }
        }
    }

    onError(err: Error | AxiosError) {
        if(err && (err as AxiosError).response) {
            let response: AxiosResponse = (err as AxiosError).response
            if(response.status >= 400 && response.status <=499) {
                // If it's a 401 or 403 auth error, redirect the user to /login
                if(~['401', '403'].indexOf(String(response.status))) {
                    const router = require('@/router').default
                    router.push({ path: `/login?redirect=${router.currentRoute.fullPath}` })
                }
                // User errors -- typically we'll want to throw a ValidationError if we know the field name
                if(Object.keys(response.data).length > 0 && !Array.isArray(response.data)) {
                    for(let errKey in response.data) {
                        let errMessages = response.data[errKey]
                        // Typical Django response for errors: {field: ['this field is required']}
                        if(errKey && Array.isArray(errMessages)) {
                            for(let errMsg of errMessages) {
                                // Reraise same error except change its class to ValidationError
                                throw Object.assign(new ValidationError(errKey, errMsg), err)
                            }
                        }
                    }
                }
            }
        }
        
        throw err
    }

    tokenWillNeedRenewingSoon() {
        let payload = this.getTokenPayload()
        if(payload && payload.exp) {
            return (payload.exp - Client.TOKEN_RENEW_THRESHOLD) < Math.floor(Date.now() / 1000)
        } else {
            return true
        }
    }
    
    onTokenRenew() {
        // Do nothing
    }

    onAuthRequired(): Promise<any> {
        return new Promise((r) => r())
    }

    async renewToken() {
        try {
            this.refreshingUserToken = true
            let result = await this.post(Client.TOKEN_RENEW_PATH, { token: this.token })
            this.token = result.data.token
            this.onTokenRenew()
        } catch(e) {
            throw new Error(`Couldn't renew token: ${e.message}`)
        } finally {
            this.refreshingUserToken = false
        }
    }
}
