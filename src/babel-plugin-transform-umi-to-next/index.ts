import * as parser from '@babel/parser';
import traverse, { NodePath } from "@babel/traverse"
import * as t from '@babel/types';
import * as path from 'path';
import { exit } from 'process';
import StyleTransformer from '../style-transformer';
export default class CodeTransform {
  ast;
  filePath;
  appDir;
  code;
  constructor({
    appDir,
    filePath,
    code,
  }) {
    this.ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
    this.appDir = appDir;
    this.filePath = filePath;
    this.code = code;
  }
  async run() {
    const styleTransformer = new StyleTransformer(this.filePath)
    const styleElements = await styleTransformer.run(this.ast)
    return this.umiToNext(styleElements)
  }
  hasJsx(ast): boolean {
    let isJSX = false
    traverse(ast, {
      JSXElement() {
        isJSX = true
      }
    })
    return isJSX
  }
  umiToNext(styleElement) {
    const isJSX = this.hasJsx(this.ast)
    try {
      traverse(this.ast, {
        Program: {
          enter(rootPath) {
            const bodyNode = rootPath.get('body') as NodePath<t.Node>[]
            if (!isJSX) {
              return
            }
            const defaultNode = bodyNode.find(p => p.isExportDefaultDeclaration())
            let defaultName = defaultNode.node.declaration?.name;
            defaultNode.traverse({
              CallExpression(p) {
                defaultName = p.node.arguments[0].name
                if (defaultName) {
                  p.stop()
                }
              }
            })
            const filteredNode = bodyNode.filter(p => !p.isExportDefaultDeclaration() && !p.isImportDeclaration() && !p.isExpressionStatement() && !p.isExportNamedDeclaration())
            const findedNode = filteredNode.find(p => p.isVariableDeclaration() ? p.node.declarations[0].id.name === defaultName : p.node.id.name === defaultName)
            findedNode?.traverse({
              JSXElement(astPath) {
                if (astPath.parentPath.isJSXFragment()) {
                  astPath.insertBefore(...styleElement)
                  astPath.stop()
                  return
                }
                if (astPath.parentPath.isReturnStatement()) {
                  astPath.node.children.unshift(...styleElement)
                  astPath.stop()
                  return
                }
              }
            })
            const expressionNode = bodyNode.filter(p=>p.isExpressionStatement()).find(p=>p.node.expression.left?.property.name === 'getInitialProps')
            if(expressionNode) {
              const functionNode = t.functionDeclaration(t.identifier('getServerSideProps'), [], t.blockStatement([]))
              functionNode.async = true
              const exportNode = t.exportNamedDeclaration(functionNode)

              expressionNode.replaceWith(exportNode)
              expressionNode.stop()
            }

          },
          exit(rootPath) {
            rootPath.traverse({
              JSXElement(astPath) {
                if (astPath.node.openingElement.name.name === 'Helmet' && astPath.node.closingElement.name.name === 'Helmet') {
                  astPath.node.openingElement.name.name = astPath.node.closingElement.name.name = 'Head'
                  const importHead = t.importDeclaration([t.importDefaultSpecifier(t.identifier('Head'))], t.stringLiteral('next/head'))
                  rootPath.get('body').find(p => p.isImportDeclaration()).insertAfter(importHead)
                }
              }
            })
          }
        },

      })
    } catch (e) {
      console.log('------------', e)
    }

    return this.ast
  }
}
