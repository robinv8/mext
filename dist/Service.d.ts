interface Config {
    copy: {
        files: string[];
        directories: string[];
    };
    transform: string[];
    metas?: any;
    links?: any;
    scripts?: any;
}
declare class Service {
    appDir: any;
    config: Config;
    tsConfig: any;
    constructor();
    loadConfig(): any;
    loadTsConfig(): any;
    run(): Promise<void>;
    umiToNext(filePath: any, fileName: any, type: any): Promise<void>;
    copyFile(filePath: any, filename: any, type: any): void;
    fileDisplay(filePath: any, type: any): void;
    getCode(filePath: any, fileName: any): string;
    transformTask(type: any): void;
    routerTransformTask(): Promise<void>;
    copyTask(): void;
    generateHeader(): void;
}
export default Service;
