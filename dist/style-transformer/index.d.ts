import * as t from '@babel/types';
declare class StyleTransformer {
    appDir: any;
    filePath: any;
    constructor(filePath: any);
    getScss(ast: any): string[];
    getCss(paths: any): Promise<any[]>;
    sassToCss(codePath: any, fileName: any): Promise<string>;
    createStyleElement(css: any): t.JSXElement;
    run(ast: any): Promise<t.JSXElement[]>;
}
export default StyleTransformer;
