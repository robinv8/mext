interface Route {
    source: any;
    destination: any;
}
declare class RouterTransformer {
    routes: any;
    constructor(routes: any);
    transform(): Route[];
}
export default RouterTransformer;
