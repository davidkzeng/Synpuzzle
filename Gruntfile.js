module.exports = function(grunt) {
  grunt.initConfig({
    pug: {
      compile: {
	data: {
	  debug: false
	},
        files: [{
	  cwd: 'views/jade',
	  src: '**/*.jade',
	  dest: 'views',
	  expand: true,
	  ext: '.html'
	}]
      }
    },
    watch: {
      pug: {
	files: [
	  'views/jade/**/*.jade'
	],
	tasks: ['pug']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-pug');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', [
    'pug',
    'watch'   
  ]);

};
