import { ResourceClassLike } from 'rest-resource'

export interface IMapResources {
    [key: string]: () => ResourceClassLike
}

export function requireResource<T extends ResourceClassLike = ResourceClassLike>(name: string): T {
    return require(`@/resources/${name}`).default as T
}

export function mapResources(resources: string[]): IMapResources {
    let resourcesObj: IMapResources = {}
    for (let resourceName of resources) {
        let Cls = requireResource(resourceName)
        resourcesObj[Cls.name] = () => Cls
    }
    return resourcesObj
}

// @sigma-only
export function hostnameToName(hostname: string) {
    let formatted = hostname.replace(/https?:\/\//gi, '')
    if(formatted.match('.sigmacloud.io')) {
        let formattedPieces = formatted.replace('.sigmacloud.io', '').split('')
        formattedPieces[0] = formattedPieces[0].toUpperCase()
        formatted = formattedPieces.join('')
    }
    return formatted
}
