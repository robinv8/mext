"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RouterTransformer = /** @class */ (function () {
    function RouterTransformer(routes) {
        this.routes = routes;
    }
    RouterTransformer.prototype.transform = function () {
        var routerList = [];
        this.routes.forEach(function (route) {
            var path = route.path, component = route.component, routes = route.routes;
            if (routes) {
                routes.forEach(function (route) {
                    var component = route.component;
                    if (route.path !== '*') {
                        routerList.push({
                            source: path !== '/' ? path + route.path : route.path,
                            destination: component.replace('@/pages', '')
                        });
                    }
                });
            }
            if (!routes && path !== '*') {
                routerList.push({
                    source: path,
                    destination: component.replace(/^@(\/pages)?/, ''),
                });
            }
        });
        return routerList;
    };
    return RouterTransformer;
}());
exports.default = RouterTransformer;
//# sourceMappingURL=index.js.map