const core = require('@actions/core');

try {
  const whoToGreet = core.getInput('who-to-greet');
  console.log(`Hello, ${whoToGreet}!`);
  const time = new Date().toTimeString();
  core.setOutput('time', time);
} catch (error) {
  core.setFailed(error.message);
}

