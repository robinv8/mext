
interface Route {
  source;
  destination;
}
class RouterTransformer {
  routes
  constructor(routes) {
    this.routes = routes
  }
  transform() {
    const routerList: Route[] = [];
    this.routes.forEach(route => {
      const { path, component, routes } = route;
      if (routes) {
        routes.forEach(route => {
          const { component } = route;
          if (route.path !== '*') {
            routerList.push({
              source: path !== '/' ? path + route.path : route.path,
              destination: component.replace('@/pages', '')
            })
          }

        })
      }

      if (!routes && path !== '*') {
        routerList.push({
          source: path,
          destination: component.replace(/^@(\/pages)?/, ''),
        });
      }

    });
    return routerList;
  }
}

export default RouterTransformer
