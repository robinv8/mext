// @ts-nocheck

import { readFileSync } from 'fs';
import { join, relative } from 'path';
import { isValidModel } from './isValidModel';
import { lodash, glob, winPath } from '@utils'
export function getModels(opts: {
  base: string;
  cwd: string;
  pattern?: string;
  skipModelValidate?: boolean;
  extraModels?: string[];
}) {
  return lodash
    .uniq(
      glob
        .sync(opts.pattern || '**/*.{ts,tsx,js,jsx}', {
          cwd: opts.base,
        })
        .map((f) => join(opts.base, f))
        .concat(opts.extraModels || [])
        .map(winPath),
    )
    .filter((f) => {
      if (/\.d.ts$/.test(f)) return false;
      if (/\.(test|e2e|spec).(j|t)sx?$/.test(f)) return false;

      // 允许通过配置下跳过 Model 校验
      if (opts.skipModelValidate) return true;

      // TODO: fs cache for performance
      try {
        return isValidModel({
          content: readFileSync(f, 'utf-8'),
        });
      } catch (error) {
        throw new Error(
          `Dva model ${winPath(
            relative(opts.cwd, f),
          )} parse failed, ${error}`,
        );
      }
    });
}
