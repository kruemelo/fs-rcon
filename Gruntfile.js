module.exports = function (grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        
        jshint: {
            all: [
                'Gruntfile.js',
                'fs-rcon.js',
                'test/**/*Spec.js'
            ],
            options: {
                jshintrc: '.jshintrc',
            },
        },

        // Before generating any new files, remove any previously-created files.
        clean: {
            tests: ['tmp'],
        },

        // Configuration to be run (and then tested).
        'mocha_require_phantom': {

            options: {
                base: 'test',
                main: 'test-bootstrap',
                requireLib: '../node_modules/requirejs/require.js',
                files: ['./**/*Spec.js'],
                router: require('./test/router'),
                port: 3000,
                // keepAlive: true
            },

            target: {
                
            }
        }, 

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %>@<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: '<%= pkg.name %>.js',
                dest: '<%= pkg.name %>.min.js'
            }
        }
    });

    // Load npm tasks.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-mocha-require-phantom');

    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('test', ['clean', 'mocha_require_phantom']);

    grunt.registerTask('build', ['uglify']);

    // Default task(s).
    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint', 'test']);

};