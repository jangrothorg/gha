const core = require('@actions/core');

// TODO: wrap all of this in a try/catch — call core.setFailed(err.message) on error,
// that's how a JS action reports failure back to the runner.

// TODO: read the `who-to-greet` input with core.getInput('who-to-greet')
// TODO: log it, e.g. console.log(`Hello, ${who}!`)
// TODO: set the `time` output with core.setOutput('time', new Date().toTimeString())

// Reminder once this works: npm install, then npm run build (ncc bundles src/index.js
// into dist/index.js) — the runner executes dist/index.js directly, it never runs
// `npm install` itself, so dist/ has to be committed, not just built locally.
