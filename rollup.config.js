import { nodeResolve } from '@rollup/plugin-node-resolve';
import del from 'rollup-plugin-delete';
import pkg from './package.json' with { type: 'json' };
import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

const extensions = ['.js', '.ts', '.tsx'];
const external = (_) => /node_modules/.test(_) && !/@swc\/helpers/.test(_);

function transpileTypescript() {
  return {
    name: 'transpile-typescript',
    transform(code, id) {
      if (!/\.(ts|tsx)$/.test(id)) return null;
      if (/\.d\.ts$/.test(id)) return null;

      const result = ts.transpileModule(code, {
        fileName: id,
        compilerOptions: {
          target: ts.ScriptTarget.ES2020,
          module: ts.ModuleKind.ESNext,
          // Keep classic React transform to support React 16+ peer dependency
          jsx: ts.JsxEmit.React,
          sourceMap: true,
          inlineSources: true
        }
      });

      // Remove trailing sourcemap comment; Rollup will handle sourcemaps itself.
      const transformedCode = result.outputText.replace(
        /\/\/# sourceMappingURL=.*\n?$/g,
        ''
      );

      return {
        code: transformedCode,
        map: result.sourceMapText ? JSON.parse(result.sourceMapText) : null
      };
    }
  };
}

function copyDrawIoWebappToDist() {
  let copied = false;

  return {
    name: 'copy-drawio-webapp-to-dist',
    async writeBundle() {
      if (copied) return;
      copied = true;

      const sourceDir = path.resolve('drawio-dev/src/main/webapp');
      const targetDir = path.resolve('dist/drawio');

      // Keep draw.io original folder structure for easier upstream upgrades
      await fs.rm(targetDir, { recursive: true, force: true });
      await fs.mkdir(path.dirname(targetDir), { recursive: true });
      await fs.cp(sourceDir, targetDir, { recursive: true });

      // Clean up .map files from the copied assets
      async function deleteMapFiles(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            await deleteMapFiles(fullPath);
          } else if (entry.isFile() && entry.name.endsWith('.map')) {
            await fs.unlink(fullPath);
          }
        }
      }
      await deleteMapFiles(targetDir);
    }
  };
}

const plugins = (targets) => [
  del({ targets: 'dist/*' }),
  nodeResolve({
    extensions
  }),
  transpileTypescript(),
  copyDrawIoWebappToDist()
];

export default {
  input: './src/index.ts',
  plugins: plugins('defaults and supports es6-module'),
  external,
  output: [
    {
      file: pkg.publishConfig.exports.import,
      format: 'es',
      sourcemap: false
    },
    {
      file: pkg.publishConfig.exports.require,
      format: 'cjs',
      sourcemap: false
    }
  ]
};
