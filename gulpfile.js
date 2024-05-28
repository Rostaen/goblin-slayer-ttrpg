var gulp = require('gulp');
var less = require('gulp-less');

gulp.task('less', cb => {
  gulp
		.src('less/gs.less')
		.pipe(less())
		.pipe(gulp.dest("./css/"));
	cb();
});

gulp.task(
	'default',
	gulp.series('less', cb => {
		gulp.watch('less/*.less',
		gulp.series('less'));
		cb();
	})
);
