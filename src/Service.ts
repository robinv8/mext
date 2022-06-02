import * as path from 'path';
import * as fs from 'fs-extra';
import * as parser from '@babel/parser';
import traverse from "@babel/traverse"
import generator from '@babel/generator'
import * as t from '@babel/types';
import CodeTransform from './babel-plugin-transform-umi-to-next';
import RouterTransformer from './router-transformer';
import pluginDva from './plugin-dva';
class Service {
  appDir;
  config = {
    copyDirectories: ['assets', 'models', 'services', 'sf', 'utils', 'common']
  }
  constructor() {
    this.appDir = path.resolve(process.cwd())
  }
  async umiToNext(filePath, fileName, type) {
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
    const newFilePath = filePath.replace(`/src/${type}`, `/.uext/${type}`)
    if (!fs.existsSync(newFilePath)) {
      fs.mkdirSync(newFilePath, { recursive: true });
    }
    let newFileName = fileName
    if(newFilePath.toLowerCase().indexOf('component')===-1) {
      newFileName = fileName.replace('.tsx', '.page.tsx')
    }
    fs.writeFileSync(path.join(newFilePath, newFileName), result.code)
  }
  copyFile(filePath, filename, type) {
    const newFilePath = filePath.replace(`/src/${type}`, `/.uext/${type}`)
    if (!fs.existsSync(newFilePath)) {
      fs.mkdirSync(newFilePath, { recursive: true });
    }
    fs.writeFileSync(path.join(newFilePath, filename), fs.readFileSync(path.join(filePath, filename)))
  }
  fileDisplay(filePath, type) {
    // 显示目录下的所有文件名
    fs.readdir(filePath, (err, files) => {
      if (err) {
        console.warn(err)
      } else {
        files.forEach((filename) => {
          if (fs.statSync(path.join(filePath, filename)).isDirectory()) {
            this.fileDisplay(path.join(filePath, filename), type);
          } else {
            if (filename.match('.tsx') && filePath.indexOf('__test__') === -1) {
              this.umiToNext(filePath, filename, type)
            } else if (filename.match('.scss')) {
              if (filename.match('.module.scss')) {
                this.copyFile(filePath, filename, type)
              }
            } else {
              this.copyFile(filePath, filename, type)
            }
          }
        });
      }
    });
  }
  getCode(filePath, fileName) {
    return fs.readFileSync(path.join(filePath, fileName)).toString()
  }

  async run() {
    this.transformTask('pages')
    this.transformTask('components')

    // this.routerTransformTask();

    // this.copyTask()
    // this.umiToNext(path.join(this.appDir, 'src/pages/Portal'), 'index.tsx', 'pages')

    // console.log(process.cwd())
    // pluginDva()
  }
  transformTask(type) {
    const pagesPath = path.join(this.appDir, `src/${type}`)
    this.fileDisplay(pagesPath, type)
  }
  async routerTransformTask() {
    const routerPath = path.join(this.appDir, 'routes.json')
    const nextConfigPath = path.join(this.appDir, '.uext/next.config.js')
    const routes = require(routerPath)
    const routerTransformer = new RouterTransformer(routes);
    const nextRoutes = routerTransformer.transform();

    const nextConfigFile = fs.readFileSync(nextConfigPath)
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
    fs.writeFileSync(nextConfigPath, result.code)

  }
  copyTask() {
    const appDir = this.appDir
    this.config.copyDirectories.forEach(type => {
      const filePath = path.join(appDir, `src/${type}`)
      const distPath = path.join(appDir, `.uext/${type}`)
      fs.copySync(filePath, distPath)
    })
  }

}

export default Service;
