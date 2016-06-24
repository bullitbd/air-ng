'use strict';

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-stylus');


  grunt.initConfig({
    jshint: {
      options: {
        node: true,
        browser: true,
        force: true
      },
      server: {
        src: ['*.js', 'routes/**/*.js', 'models/**/*.js', 'controllers/**/*.js', 'lib/**/*.js']
      },
      client: {
        src: ['app/**/*.js', '!app/js/lib/**/*.js'],
        options: {
          globals: {
            //angular: true,
            $: true,
            document: true
          }
        }
      },
      // mocha: {
      //   src: ['test/*test.js'],
      //   options: {
      //     globals: {
      //       describe: true,
      //       it: true,
      //       before: true,
      //       beforeEach: true,
      //       after: true,
      //       afterEach: true
      //     }
      //   }
      // },

      // karma: {
      //   src: ['test/karma_tests/*test.js'],
      //   options: {
      //     globals: {
      //       angular: true,
      //       describe: true,
      //       it: true,
      //       expect: true,
      //       before: true,
      //       after: true,
      //       beforeEach: true,
      //       afterEach: true
      //     }
      //   }
      // }
    },

    // simplemocha: {
    //   dev: {
    //     src: ['test/*_test.js']
    //   }
    // },
    //

    watch: {
      stylus: {
        files: ['app/css/**/*'],
        tasks: ['stylus:compile']
      },
      client: {
        files: ['app/**/*.js', 'app/**/*.html'],
        tasks: ['build']
      }
    },

    stylus: {
      compile: {
        options: {
          paths: ['node_modules', 'app/css/**/*'],
          linenos: false,
          "include css": true
        },

        files: {
          './build/css/style.css': './app/css/main.styl'
        }
      }
    },

    webpack: {
      client: {
        // webpack options
        entry: __dirname + '/app/js/client.js',
        output: {
          path: 'build/',
          filename: 'bundle.js'
        }
      },
      // karma_test: {
      //   entry: __dirname + '/test/karma_tests/test_entry.js',
      //   output: {
      //     path: 'test/karma_tests/',
      //     file: 'bundle.js'
      //   }
      // }
    },

    copy: {
      html: {
        cwd: 'app/',
        expand: true,
        flatten: false,
        src: ['**/*.html', 'fonts/*'],
        dest: 'build/',
        filter: 'isFile'
      },
      // fonts: {
      //   cwd: 'app/',
      //   expand:true,
      //   src:['fonts/*'],
      //   dest:'build/,
      //   filter:'isFile'
      // }
    },

    // karma: {
    //   test: {
    //     configFile: 'karma.conf.js'
    //   }
    // },

    clean: {
      build: {
        src: ['build']
      }
    }

  });

  grunt.registerTask('lint', ['jshint:server', 'jshint:client', 'jshint:mocha']);
  // grunt.registerTask('mochatest', ['jshint:client', 'jshint:mocha', 'simplemocha:dev']);
  // grunt.registerTask('karmatest', ['jshint:karma', 'webpack:karma_test', 'karma:test']);
  // grunt.registerTask('test', ['mochatest', 'karmatest']);
  grunt.registerTask('build', ['jshint:client', 'webpack:client', 'copy:html', 'stylus:compile']);
  // grunt.registerTask('default', ['lint', 'test']);
};
