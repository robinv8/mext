import * as path from 'path';
import * as fs from 'fs';
import * as parser from '@babel/parser';
import traverse from "@babel/traverse"
import generator from '@babel/generator'
import * as t from '@babel/types';
import CodeTransform from './babel-plugin-transform-umi-to-next';
import RouterTransformer from './router-transformer';

class Service {
  appDir;
  config = {
    sourceCode: '',
  }
  constructor() {
    this.appDir = path.resolve(process.cwd())
  }
  getPagePath(name) {
    return path.join(this.appDir, 'src/.uext/pages', name)
  }
  async umiToNext(filePath, fileName) {
    const appDir = this.appDir
    const code = this.getCode(filePath, fileName)
    const transform = new CodeTransform({
      appDir,
      filePath,
      code,
    })
    const ast = await transform.run()

    const result = generator(ast, {
      retainLines: true,
    })
    const newFilePath = filePath.replace('/pages', '/.uext/pages')
    if (!fs.existsSync(newFilePath)) {
      fs.mkdirSync(newFilePath, { recursive: true });
    }
    fs.writeFileSync(path.join(newFilePath, 'index.tsx'), result.code)
  }
  copyFile(filePath, filename) {
    const newFilePath = filePath.replace('/pages', '/.uext/pages')
    if (!fs.existsSync(newFilePath)) {
      fs.mkdirSync(newFilePath, { recursive: true });
    }
    fs.writeFileSync(path.join(newFilePath, filename), fs.readFileSync(path.join(filePath, filename)))
  }
  fileDisplay(filePath) {
    // 显示目录下的所有文件名
    fs.readdir(filePath, (err, files) => {
      if (err) {
        console.warn(err)
      } else {
        files.forEach((filename) => {
          if (fs.statSync(path.join(filePath, filename)).isDirectory()) {
            this.fileDisplay(path.join(filePath, filename));
          } else {
            if (filename.match('.tsx') && filePath.indexOf('__test__') === -1) {
              this.umiToNext(filePath, filename)
            } else if (filename.match('.scss') && filename.match('.module.scss')) {
              this.copyFile(filePath, filename)
            } else {
              this.copyFile(filePath, filename)
            }
          }
        });
      }
    });
  }
  getCode(filePath, fileName) {
    return fs.readFileSync(path.join(filePath, fileName)).toString()
  }
  async routerService() {
    const routerPath = path.join(this.appDir, 'routes.json')
    const routes = require(routerPath)
    const routerTransformer = new RouterTransformer(routes);
    const nextRoutes = routerTransformer.transform();
    const nextConfigFile = fs.readFileSync(path.join(this.appDir, 'src/.uext/next.config.js'))
    const ast = parser.parse(nextConfigFile.toString())
    traverse(ast, {
      ReturnStatement(astPath) {
        if (astPath.parentPath.parentPath.node.key.name === 'rewrites') {
          astPath.traverse({
            ObjectExpression(astPath) {
              const properties = nextRoutes.map(route => {
                return t.objectExpression([t.objectProperty(t.identifier('source'), t.stringLiteral(route.source)), t.objectProperty(t.identifier('destination'), t.stringLiteral(route.destination))])
              })
              astPath.parentPath.node.elements = properties
              astPath.stop()
            }
          })
        }
      }
    })
    const result = generator(ast)
    fs.writeFileSync(path.join(this.appDir, 'src/.uext/next.config.js'), result.code)

  }
  async run() {
    this.fileDisplay(path.join(this.appDir, 'src/pages'))
    this.routerService();
    // umiToNext 404
    // this.umiToNext(path.join(this.appDir, 'src/pages/Blogs'), 'index.tsx')
    // this.sassToCss(path.join(this.appDir, 'src'), 'global.scss')

  }

}

export default Service;
