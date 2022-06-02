import { basename, dirname, extname, join, relative } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { getModels } from './getModels/getModels';
import { lodash, Mustache } from '@utils';
export default () => {
  function getModelDir() {
    return 'models';
  }
  function getAllModels() {
    const srcPath = join(process.cwd(), '.uext')
    return lodash.uniq([
      ...getModels({
        base: srcPath,
        cwd: '',
        pattern: `**/${getModelDir()}/**/*.{ts,tsx,js,jsx}`,
      }),
      ...getModels({
        base: srcPath,
        cwd: '',
        pattern: `**/model.{ts,tsx,js,jsx}`,
      }),
    ])
  }
  function onGenerateFiles() {
    const models = getAllModels();
    const hasModels = models.length > 0;
    if (!hasModels) return;

    const dvaTpl = readFileSync(join(__dirname, 'dva.tpl'), 'utf-8');
    const dvaContent = Mustache.render(dvaTpl, {
      RegisterModelImports: models
        .map((path, index) => {
          const modelName = `Model${lodash.upperFirst(
            lodash.camelCase(basename(path, extname(path))),
          )}${index}`;
          return `import ${modelName} from '${path}';`;
        })
        .join('\r\n'),
      RegisterModels: models
        .map((path, index) => {
          // prettier-ignore
          return `
app.model({ namespace: '${basename(path, extname(path))}', ...Model${lodash.upperFirst(lodash.camelCase(basename(path, extname(path))))}${index} });
          `.trim();
        })
        .join('\r\n')
    })
    writeFileSync(join(process.cwd(), '.uext/utils/dva.ts'), dvaContent, 'utf-8');
  }
  onGenerateFiles()
};
