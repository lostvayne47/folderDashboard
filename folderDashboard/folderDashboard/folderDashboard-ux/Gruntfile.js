/* jshint node: true *//* eslint-env node */

"use strict";

const loadTasksRelative = require('grunt-niagara/lib/loadTasksRelative');

const SRC_FILES = [
  'src/rc/**/*.js',
  'Gruntfile.js',
  '!**/*.built.js',
  '!**/*.built.min.js'
];
const TEST_FILES = [
  'srcTest/rc/**/*.js'
];
const JS_FILES = SRC_FILES.concat(TEST_FILES);
const ALL_FILES = JS_FILES.concat('src/rc/**/*.css');

module.exports = function runGrunt(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jsdoc: {
      src: SRC_FILES.concat([ 'README.md' ])
    },
    eslint: {
      src: JS_FILES,
      options: {
        configFile: '../../../../.eslintrc.json'
      }
    },
    babel: {
      options: {
        presets: [ '@babel/preset-env' ],
        plugins: [ '@babel/plugin-transform-react-jsx' ]
      },
      coverage: {
        options: {
          plugins: [ '@babel/plugin-transform-react-jsx', 'istanbul' ]
        }
      }
    },
    watch: {
      src: ALL_FILES
    },
    karma: {},
    requirejs: {},
    niagara: {
      station: {
        stationName: 'folderDashboard',
        forceCopy: true,
        sourceStationFolder: './srcTest/rc/stations/folderDashboard'
      }
    }
  });

  loadTasksRelative(grunt, 'grunt-niagara');
  grunt.registerTask('ci', [ 'babel:coverage', 'babel:spec', 'copy:karma', 'karma:ci', 'eslint:ci' ]);
};
