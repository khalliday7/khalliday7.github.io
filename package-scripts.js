const npsUtils = require('nps-utils')

module.exports = {
  scripts: {
    start: {
      description: 'Run the development server',
      script: 'NODE_ENV=development wp --config ./webpack.config.js',
    },
    build: {
      description: 'Build static assets',
      script: 'NODE_ENV=production wp --config ./webpack.config.js',
    },
    typecheck: {
      description: 'Run the type checks',
      script: 'tsc',
    },
    lint: {
      description: 'Lint source code to enforce code quality',
      script: 'eslint --ext .js --ext .ts --ext .tsx .',
      fix: {
        description: 'Lint source code and fix style issues',
        script: 'nps "lint --fix"',
      },
    },
    test: {
      description: 'Run tests',
      script: 'jest',
    },
    predeploy: {
      description: 'Run all predeploy steps',
      script: npsUtils.concurrent.nps('typecheck', 'lint', 'test'),
    },
    deploy: {
      description: 'Deploy GH page to the master branch of this repo.',
      script: npsUtils.series.nps(
        'predeploy',
        'rm -r ./build',
        'build',
        'gh-pages -d build -b gh-pages',
      ),
    },
  },
}
