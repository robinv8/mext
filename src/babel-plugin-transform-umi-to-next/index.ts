import * as parser from '@babel/parser';
import traverse, { NodePath } from "@babel/traverse"
import * as t from '@babel/types';
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
            if (styleElement?.length > 0) {
              const styleCode = `const _styleJSX = (<></>)`;
              const styleAst = parser.parse(styleCode, {
                sourceType: 'module',
                plugins: ['jsx', 'typescript']
              })
              traverse(styleAst, {
                JSXFragment(astPath) {
                  astPath.node.children.push(...styleElement)
                }
              })
              findedNode.insertBefore(styleAst.program.body)
              findedNode?.traverse({
                ReturnStatement(astPath) {
                  if (astPath.node.argument?.type === 'JSXElement') {
                    const objectNode = t.jsxExpressionContainer(t.identifier('_styleJSX'));
                    astPath.node.argument.children.push(objectNode)
                  }
                  if (astPath.node.argument?.type === "JSXFragment") {
                    const objectNode = t.jsxExpressionContainer(t.identifier('_styleJSX'));
                    astPath.node.argument.children.push(objectNode)
                  }
                },
              })
            }

            const expressionNode = bodyNode.filter(p => p.isExpressionStatement()).find(p => p.node.expression.left?.property?.name === 'getInitialProps')
            if (expressionNode) {
              const functionNode = t.variableDeclaration('const', [t.variableDeclarator(t.identifier('getServerSideProps'),
                expressionNode.node.expression.right.expression)])
              const exportNode = t.exportNamedDeclaration(functionNode)

              expressionNode.replaceWith(exportNode)
              expressionNode.stop()
            }

          },
          exit(rootPath) {
            let isCreateHead = false, isCreateImage = false
            rootPath.traverse({
              ImportSpecifier(astPath) {
                if (astPath.node.imported.name === 'Helmet') {
                  astPath.remove()
                }

              },
              JSXElement(astPath) {
                if (astPath.node.openingElement.name.name === 'Helmet' && astPath.node.closingElement.name.name === 'Helmet') {
                  astPath.node.openingElement.name.name = astPath.node.closingElement.name.name = 'Head'
                  if (isCreateHead) {
                    return
                  }
                  isCreateHead = true
                  const importHead = t.importDeclaration([t.importDefaultSpecifier(t.identifier('Head'))], t.stringLiteral('next/head'))
                  rootPath.get('body').find(p => p.isImportDeclaration()).insertAfter(importHead)
                }

                // if (astPath.node.openingElement?.name?.name === 'img' && (!astPath.node.closingElement?.name?.name || astPath.node.closingElement?.name?.name === 'img')) {

                // }
                astPath.traverse({
                  JSXExpressionContainer(astPath) {
                    if (astPath.node.expression.type === 'CallExpression' && astPath.node.expression.callee.name === 'require') {
                      astPath.node.expression = t.memberExpression(astPath.node.expression, t.identifier('default.src'),)
                    }
                  }
                })
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
