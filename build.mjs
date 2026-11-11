import { existsSync } from 'node:fs';
import { readdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = fileURLToPath(new URL('.', import.meta.url));
const migrations = (await readdir(resolve(root, 'src', 'migrations'), { withFileTypes: true }))
    .filter((file) => file.isFile() && file.name.endsWith('.migration.ts'))
    .map((file) => file.name);

await build({
    absWorkingDir: root,
    entryPoints: [
        { in: 'src/index.ts', out: 'index' },
        { in: 'src/tools/migration/migration-cli.ts', out: 'migration-cli' },
        ...migrations.map((name) => ({
            in: resolve(root, 'src', 'migrations', name),
            out: `migrations/${name.replace(/\.ts$/, '')}`,
        })),
    ],
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'es2022',
    packages: 'external',
    outdir: 'dist',
    logLevel: 'info',
});

const outputDirectory = resolve(root, 'dist', 'migrations');
if (existsSync(outputDirectory)) {
    const expected = new Set(migrations.map((name) => name.replace(/\.ts$/, '.js')));
    const stale = (await readdir(outputDirectory, { withFileTypes: true }))
        .filter((file) => file.isFile() && file.name.endsWith('.migration.js') && !expected.has(file.name));
    await Promise.all(stale.map((file) => rm(resolve(outputDirectory, file.name))));
}
