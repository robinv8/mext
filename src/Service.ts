import * as path from 'path';
import * as fs from 'fs-extra';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generator from '@babel/generator';
import * as t from '@babel/types';
import CodeTransform from './babel-plugin-transform-umi-to-next';
import RouterTransformer from './router-transformer';
import pluginDva from './plugin-dva';

interface Config {
  copy: {
    files: string[];
    directories: string[];
  };
  transform: string[];
  metas?;
  links?;
  scripts?;
}
class Service {
  appDir;
  config: Config;
  tsConfig;
  constructor() {
    this.appDir = path.resolve(process.cwd());
    this.config = this.loadConfig();
    this.tsConfig = this.loadTsConfig();
  }
  loadConfig() {
    const configPath = path.join(this.appDir, '.uextrc.ts');
    const config = require(configPath);
    return config;
  }
  loadTsConfig() {
    const tsConfigPath = path.join(this.appDir, 'tsconfig.json');
    const tsConfig = require(tsConfigPath);
    return tsConfig;
  }
  async run() {
    this.copyTask();
    const nextConfigPath = path.join(this.appDir, '.uext', 'next.tsconfig.json');
    const tsConfigPath = path.join(this.appDir, '.uext', 'tsconfig.json');
    fs.renameSync(nextConfigPath, tsConfigPath);

    this.config.transform.forEach((type) => {
      this.transformTask(type);
    });
    this.routerTransformTask();
    pluginDva();
    this.generateHeader();

    // this.umiToNext(path.join(this.appDir, 'src/pages/Activity/components/Item'), 'index.tsx', 'pages')
  }
  async umiToNext(filePath, fileName, type) {
    const appDir = this.appDir;
    const code = this.getCode(filePath, fileName);
    const transform = new CodeTransform({
      appDir,
      filePath,
      code,
    });
    const ast = await transform.run();

    const result = generator(ast, {
      retainLines: true,
    });
    const newFilePath = filePath.replace(`/src/${type}`, `/.uext/${type}`);
    if (!fs.existsSync(newFilePath)) {
      fs.mkdirSync(newFilePath, { recursive: true });
    }
    let newFileName = fileName;
    if (newFilePath.toLowerCase().indexOf('component') === -1) {
      newFileName = fileName.replace('.tsx', '.page.tsx');
    }
    fs.writeFileSync(path.join(newFilePath, newFileName), result.code);
  }
  copyFile(filePath, filename, type) {
    const newFilePath = filePath.replace(`/src/${type}`, `/.uext/${type}`);
    if (!fs.existsSync(newFilePath)) {
      fs.mkdirSync(newFilePath, { recursive: true });
    }
    fs.writeFileSync(
      path.join(newFilePath, filename),
      fs.readFileSync(path.join(filePath, filename)),
    );
  }
  fileDisplay(filePath, type) {
    // 显示目录下的所有文件名
    const files = fs.readdirSync(filePath);

    files.forEach((filename) => {
      if (fs.statSync(path.join(filePath, filename)).isDirectory()) {
        this.fileDisplay(path.join(filePath, filename), type);
      } else {
        if (filename.match('.tsx') && filename.indexOf('_app.page.tsx') === -1 && filePath.indexOf('__test__') === -1) {
          this.umiToNext(filePath, filename, type)
        } else if (filename.match('.scss')) {
          if (filename.match('.module.scss')) {
            this.copyFile(filePath, filename, type);
          }
        } else {
          this.copyFile(filePath, filename, type);
        }
      }
    });

  }
  getCode(filePath, fileName) {
    return fs.readFileSync(path.join(filePath, fileName)).toString();
  }

  transformTask(type) {
    const pagesPath = path.join(this.appDir, `src/${type}`);
    this.fileDisplay(pagesPath, type);
  }
  async routerTransformTask() {
    const routerPath = path.join(this.appDir, 'routes.json');
    const nextConfigPath = path.join(this.appDir, '.uext/next.config.js');
    const routes = require(routerPath);
    const routerTransformer = new RouterTransformer(routes);
    const nextRoutes = routerTransformer.transform();

    const nextConfigFile = fs.readFileSync(nextConfigPath);
    const ast = parser.parse(nextConfigFile.toString());
    traverse(ast, {
      ObjectExpression(astPath) {
        if (astPath.parent.type !== 'AssignmentExpression') {
          return;
        }
        const rewrites = nextRoutes.map((route) => {
          return t.objectExpression([
            t.objectProperty(
              t.identifier('source'),
              t.stringLiteral(route.source),
            ),
            t.objectProperty(
              t.identifier('destination'),
              t.stringLiteral(route.destination),
            ),
          ]);
        });
        const newRoutes = t.arrayExpression(rewrites);
        const arrowFunction = t.arrowFunctionExpression(
          [],
          newRoutes,
        )

        arrowFunction.async = true;
        const filtered = astPath.node.properties.filter(
          (property) => property.key.name === 'rewrites',
        );
        if (filtered.length > 0) {
          filtered[0].value = arrowFunction;
        } else {
          astPath.node.properties.push(
            t.objectProperty(t.identifier('rewrites'), arrowFunction),
          );
        }
      },
    });
    const result = generator(ast);
    fs.writeFileSync(nextConfigPath, result.code);
  }
  copyTask() {
    const appDir = this.appDir;
    this.config.copy.directories.forEach((type) => {
      const filePath = path.join(appDir, `src/${type}`);
      const distPath = path.join(appDir, `.uext/${type}`);
      fs.copySync(filePath, distPath);
    });

    this.config.copy.files.forEach((filename) => {

      let filePath = path.join(appDir, filename);

      if (!fs.existsSync(filePath)) {
        filePath = path.join(appDir, 'src', filename);
      }
      const distPath = path.join(appDir, `.uext/${filename}`);
      fs.copySync(filePath, distPath);
    });
  }
  generateHeader() {
    const code = fs.readFileSync(path.join(this.appDir, '.uext/layouts/index.tsx'));

    const ast = parser.parse(code.toString(), {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });

    const metaAst = this.config?.metas?.map((meta) => {
      const keys = Object.keys(meta);
      return t.jsxElement(
        t.jsxOpeningElement(t.jsxIdentifier('meta'), keys.map(key => {
          return t.jsxAttribute(t.jsxIdentifier(key), t.stringLiteral(meta[key]))
        })),
        t.jsxClosingElement(t.jsxIdentifier('meta')),
        []
      );

    })
    const linkAst = this.config?.links?.map((link) => {
      const keys = Object.keys(link);
      return t.jsxElement(
        t.jsxOpeningElement(t.jsxIdentifier('link'), keys.map(key => {
          return t.jsxAttribute(t.jsxIdentifier(key), t.stringLiteral(link[key]))
        })),
        t.jsxClosingElement(t.jsxIdentifier('link')),
        []
      );

    })
    const scriptAst = this.config?.scripts?.map((script) => {
      const keys = Object.keys(script);
      return t.jsxElement(
        t.jsxOpeningElement(t.jsxIdentifier('script'), keys.map(key => {
          return t.jsxAttribute(t.jsxIdentifier(key), t.stringLiteral(script[key]))
        })),
        t.jsxClosingElement(t.jsxIdentifier('script')),
        []
      );
    })

    traverse(ast, {
      JSXElement(astPath) {
        if (astPath.node.openingElement.name.name === 'Helmet') {
          astPath.node.children = [...astPath.node.children, ...metaAst, ...linkAst, ...scriptAst];
        }
      }
    });

    const result = generator(ast);
    fs.writeFileSync(path.join(this.appDir, '.uext/layouts/index.tsx'), result.code);
  }
}

export default Service;
