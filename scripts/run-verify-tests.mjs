import { spawnSync } from 'node:child_process'

const isWorkersBuild = process.env.WORKERS_CI === '1'
const testScript = isWorkersBuild ? 'test:core' : 'test'

if (isWorkersBuild) {
  console.log(
    'Cloudflare Workers Builds detected: running Node and Worker tests; Playwright UI verification remains in GitHub Actions.',
  )
}

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const result = spawnSync(npmCommand, ['run', testScript], {
  env: process.env,
  stdio: 'inherit',
})

if (result.error) {
  throw result.error
}

if (result.signal) {
  console.error(`Test command terminated by signal ${result.signal}.`)
  process.exit(1)
}

process.exit(result.status ?? 1)
