import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const consumer = mkdtempSync(join(tmpdir(), 'agala-ui-consumer-'))
const tarballs = join(consumer, 'tarballs')
mkdirSync(tarballs)

function npm(args, cwd = root) {
  return execFileSync('npm', args, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, npm_config_cache: join(consumer, '.npm-cache') },
    stdio: ['ignore', 'pipe', 'inherit'],
  })
}

function pack(args, manifestPath) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  npm(['pack', '--pack-destination', tarballs, ...args])
  const filename = `${manifest.name.replace(/^@/, '').replace('/', '-')}-${manifest.version}.tgz`
  return join(tarballs, filename)
}

const uiTarball = pack([], join(root, 'package.json'))
const chartsTarball = pack(['--workspace', '@agala-labs/charts'], join(root, 'packages/charts/package.json'))

writeFileSync(join(consumer, 'package.json'), JSON.stringify({
  private: true,
  type: 'module',
  scripts: { check: 'tsc --noEmit' },
}, null, 2))

npm([
  'install',
  '--ignore-scripts',
  uiTarball,
  chartsTarball,
  'vue@^3.3.0',
  'echarts@^5.6.0',
  'vue-echarts@^7.0.3',
  'typescript@~5.6.0',
], consumer)

writeFileSync(join(consumer, 'tsconfig.json'), JSON.stringify({
  compilerOptions: {
    strict: true,
    target: 'ES2022',
    module: 'ESNext',
    moduleResolution: 'Bundler',
    skipLibCheck: true,
  },
  include: ['consumer.ts'],
}, null, 2))

writeFileSync(join(consumer, 'consumer.ts'), `
import { AgalaButton, AgalaIcon, AgalaSectionNav, AgalaUI, useMediaQuery } from '@agala-labs/ui'
import type { AgalaIconProps, SectionNavItem } from '@agala-labs/ui'
import { BaseChart, useChartTheme } from '@agala-labs/charts'
import '@agala-labs/ui/reset.css'
import '@agala-labs/ui/themes/main.css'

const sectionItems: SectionNavItem[] = [{ value: 'general', label: 'General', icon: 'settings' }]
const iconProps: AgalaIconProps = { name: 'stock-location', size: 'sm', motion: 'hover' }
void [AgalaButton, AgalaIcon, AgalaSectionNav, AgalaUI, BaseChart, useMediaQuery, useChartTheme, sectionItems, iconProps]
`)

npm(['run', 'check'], consumer)

const packageJson = JSON.parse(readFileSync(join(consumer, 'node_modules/@agala-labs/ui/package.json'), 'utf8'))
for (const entry of ['.', './reset.css', './themes/main.css', './themes/smaltt.css', './themes/kervo.css']) {
  if (!(entry in packageJson.exports)) throw new Error(`Missing @agala-labs/ui export: ${entry}`)
}

readFileSync(join(consumer, 'node_modules/@agala-labs/ui/dist/licenses/lucide.txt'), 'utf8')
