export default class CodeTransform {
    ast: any;
    filePath: any;
    appDir: any;
    code: any;
    constructor({ appDir, filePath, code, }: {
        appDir: any;
        filePath: any;
        code: any;
    });
    run(): Promise<any>;
    hasJsx(ast: any): boolean;
    umiToNext(styleElement: any): any;
}
