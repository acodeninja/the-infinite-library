/* eslint no-console: "off" */
const {copyFileSync, mkdirSync, readdirSync, existsSync, rmdirSync} = require('fs');
const {resolve} = require('path');
const {BannerPlugin, IgnorePlugin} = require('webpack');
const Docker = require('dockerode');
const { zip } = require('zip-a-folder');
const cliProgress = require('cli-progress');

const docker = new Docker;

const nodeModules = {};
readdirSync('node_modules')
  .filter(function (x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function (mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

const buildTempDir = resolve(__dirname, 'build/tmp');

if (existsSync(buildTempDir)) {
  rmdirSync(buildTempDir, {recursive: true});
}

mkdirSync(buildTempDir, {recursive: true});
copyFileSync(resolve(__dirname, 'package.json'), resolve(buildTempDir, 'package.json'));
copyFileSync(resolve(__dirname, 'yarn.lock'), resolve(buildTempDir, 'yarn.lock'));

class PackageForDeployment {
  dockerPull() {
    return new Promise((res) => {
      docker.pull('lambci/lambda:build-nodejs12.x', (err, stream) => {
        console.log('-> pulling lambci docker image');
        const layers = {};
        const progressBars = new cliProgress.MultiBar({
          clearOnComplete: false,
          format: 'layer {id} ({status}) | {bar} {percentage}% | ETA: {eta}s | {value}/{total}MB'
        }, cliProgress.Presets.shades_grey);

        const errors = [];

        stream.on('data', (row) => {
          try {
            let data = {progressDetail: {}};
            try {
              data = JSON.parse(row.toString());
            } catch (e) {
              errors.push(e);
            }

            if (!!data.id && (!!data.progressDetail.total && !!data.progressDetail.current)) {
              const {id, status, progressDetail: {current: iCurrent, total: iTotal}} = data;
              const total = Math.round(iTotal / 1000 / 1000);
              const current = Math.round(iCurrent / 1000 / 1000);

              if (!layers[id]) {
                layers[id] = {
                  bar: progressBars.create(total, current, {id, status}),
                };
              }

              layers[id].bar.update(current, {id, status, total});
            }

          } catch (e) {
            errors.push(e);
          }
        });

        stream.on('end', () => {
          progressBars.stop();
          res();
        });
      });
    });
  }

  installDependencies() {
    return new Promise((res) => {
      console.log('-> running build inside lambci image');
      docker.run(
        'lambci/lambda:build-nodejs12.x',
        [
          'bash',
          '-c',
          'npm install --global yarn && yarn install --production'
        ],
        process.stdout,
        {
          HostConfig: {
            AutoRemove: true,
            Mounts: [{
              Target: '/var/task',
              Source: buildTempDir,
              Type: 'bind',
            }],
          },
        },
        {

        },
        (err) => {
          if (err) throw err;
          res();
        }
      );
    });
  }

  async packageHandler() {
    console.log('-> packaging application');
    await zip(buildTempDir, resolve(__dirname, 'build', 'handler.zip'));
  }

  apply(compiler) {
    compiler.hooks.done.tapAsync(
      'PackageForDeployment',
      async (compilation, callback) => {
        await this.dockerPull();
        await this.installDependencies();
        await this.packageHandler();

        if (existsSync(buildTempDir)) {
          rmdirSync(buildTempDir, {recursive: true});
        }

        callback();
      }
    );
  }
}

module.exports = {
  entry: './handler.js',
  mode: process.env.PRODUCTION ? 'production' : 'development',
  output: {
    path: buildTempDir,
    filename: 'handler.js',
    libraryTarget: 'umd',
  },
  target: 'node',
  externals: nodeModules,
  devtool: 'source-map',
  plugins: [
    new PackageForDeployment,
    new IgnorePlugin(/\.(css|less)$/),
    new BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true,
      entryOnly: false
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/(node_modules)/, /(\.test\.js$)/],
        use: {loader: 'babel-loader'}
      },
      {
        test: /\.node$/,
        use: 'node-loader'
      }
    ]
  }
};
