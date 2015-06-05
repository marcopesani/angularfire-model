module.exports = function (grunt) {
    'use strict';
    // Project configuration
    grunt.initConfig({
        // Metadata
        //pkg: grunt.file.readJSON('package.json'),
        //banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        //    '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        //    '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
        //    '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        //    ' Licensed <%= props.license %> */\n',

        // Task configuration
        concat: {
            //options: {
            //    banner: '<%= banner %>',
            //    stripBanners: true
            //},
            dist: {
                src: [
                    'src/angularfire-model.js',
                    'src/angularfire-model-validator.js'
                ],
                dest: 'dist/angularfire-model.js'
            }
        },
        uglify: {
            //options: {
            //    banner: '<%= banner %>'
            //},
            dist: {
                src: '<%= concat.dist.dest %>',
                dest: 'dist/angularfire-model.min.js'
            }
        },
        jshint: {
            options: {
                node: true,
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                unused: true,
                eqnull: true,
                browser: true,
                globals: {
                    jQuery: true
                },
                boss: true
            },
            gruntfile: {
                src: 'gruntfile.js'
            },
            src_test: {
                src: ['src/**/*.js']
            }
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js',
                background: true,
                singleRun: false
            }
        },
        watch: {
            dev: {
                files: 'src/**/*.js',
                tasks: ['dev'],
                options: {
                    interrupt: true
                }
            }
        }
    });

    // These plugins provide necessary tasks
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('dev', ['jshint', 'concat', 'uglify']);
    grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'karma', 'watch']);
};