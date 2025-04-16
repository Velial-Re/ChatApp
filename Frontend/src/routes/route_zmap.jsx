import {ROUTE_PATHS} from './route_paths'
import {ROUTE_ELEMENTS} from './route_elements'

const route_map = Object.keys(ROUTE_PATHS).map((pathKey) => {
    const path = ROUTE_PATHS[pathKey]
    const component = ROUTE_ELEMENTS[pathKey]
    return {path, component}
})

export default route_map