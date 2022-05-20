import sass from 'node-sass';
import traverse, { NodePath } from "@babel/traverse"
import * as t from '@babel/types';
import packageImporter from 'node-sass-package-importer';
import aliasImporter from 'node-sass-alias-importer';
import path from 'path';

class StyleTransformer {
  appDir;
  filePath
  constructor(filePath) {
    this.appDir = path.resolve(process.cwd())
    this.filePath = filePath
  }
  getScss(ast) {
    const cssPath: string[] = []
    traverse(ast, {
      Program: {
        enter(astPath) {
          const bodyNode = astPath.get('body') as NodePath<t.Node>[]
          const styleNodes = bodyNode.filter(p => p.isImportDeclaration() && p.node.source.value.match(/\.scss/) && !p.node.source.value.match(/\.module\.scss/))
          styleNodes.forEach(p => {
            cssPath.push(p.node.source.value)
            p.remove()
          })
        }
      }
    })
    return cssPath
  }
  getCss(paths) {
    return Promise.all(paths.map(async (fileName) => {
      let name;
      if (fileName.match(/@(assets|pages)\//)) {
        name = fileName.replace('@', 'src/')
      }
      return await this.sassToCss(name ? this.appDir : this.filePath, name || fileName)
    }))
  }
  sassToCss(codePath, fileName): Promise<string> {
    return new Promise(resolve => {
      sass.render({
        file: path.join(codePath, fileName),
        importer: [
          packageImporter(),
          aliasImporter({
            "@assets": path.join(path.resolve(process.cwd()), 'src/assets/'),
          })
        ]
      }, function (err, result) {
        if (err) {
          console.log(err)
          resolve('')
          return
        }
        resolve(result.css.toString())
      })
    })

  }
  createStyleElement(css) {
    return t.jsxElement(
      t.jsxOpeningElement(t.jsxIdentifier('style'), [t.jsxAttribute(t.jsxIdentifier('jsx'))], false),
      t.jsxClosingElement(t.jsxIdentifier('style')),
      [t.jsxText("{`" + css + "`}")]
    )
  }
  async run(ast) {
    const scssPaths = this.getScss(ast)
    if (scssPaths.length === 0) {
      return []
    }
    const csses = await this.getCss(scssPaths)
    return csses.map(css=>  this.createStyleElement(css))
  }
}

export default StyleTransformer
