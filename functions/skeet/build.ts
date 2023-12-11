import { build } from 'esbuild'

void (async () => {
  await build({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    minify: true,
    outfile: './dist/index.js',
    platform: 'node',
    define: {
      'process.env.NODE_ENV': `"production"`,
    },
    format: 'cjs',
    tsconfig: './tsconfig.json',
  })

  await build({
    entryPoints: ['../../common/**/*'],
    bundle: true,
    minify: true,
    outdir: './dist',
    platform: 'node',
    define: {
      'process.env.NODE_ENV': `"production"`,
    },
    format: 'cjs',
    external: ['../../common/*'],
    tsconfig: './tsconfig.json',
  })
})()
