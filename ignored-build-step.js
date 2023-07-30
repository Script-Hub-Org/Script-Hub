const childProcess = require('child_process')
const path = require('path')

// https://vercel.com/support/articles/how-do-i-use-the-ignored-build-step-field-on-vercel
const ABORT_BUILD_CODE = 0
const CONTINUE_BUILD_CODE = 1

const continueBuild = () => process.exit(CONTINUE_BUILD_CODE)
const abortBuild = () => process.exit(ABORT_BUILD_CODE)

const app = process.argv[2] || path.basename(path.resolve())

const stepCheck = () => {
  // no app name (directory) was passed in via args
  if (!app) {
    return abortBuild()
  }

  // get all file names changed in last commit
  // const fileNameList = childProcess
  //   .execSync("git diff --name-only HEAD~1")
  //   .toString()
  //   .trim()
  //   .split("\n");

  // This modification checks against the previous successful deploy commit SHA, which is provided by vercel now. (https://vercel.com/docs/concepts/projects/environment-variables/system-environment-variables)
  const fileNameList = childProcess
    .execSync(`git diff ${process.env.VERCEL_GIT_PREVIOUS_SHA} HEAD --name-only ./`)
    .toString()
    .trim()
    .split('\n')

  // check if any files in the app, or in any shared packages have changed
  const shouldBuild = fileNameList.some(file => file.startsWith(`script-hub`) || file.startsWith('preview'))

  if (shouldBuild) {
    return continueBuild()
  }

  return abortBuild()
}

stepCheck()
