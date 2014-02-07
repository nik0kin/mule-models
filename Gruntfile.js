module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-simple-mocha');

  require('time-grunt')(grunt);

  grunt.initConfig({
    pkg: require('./package.json'),
    
    simplemocha: {
      src: 'test/**/*Spec.js',
      options: {
        reporter: 'spec'
      }
    }
  });

  grunt.registerTask('test', ['simplemocha']);
  grunt.registerTask('default', ['test']);
};
