/// <binding BeforeBuild='default' />
///
// include plug-ins
var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var del = require('del');
var minifyCSS = require('gulp-minify-css');
var copy = require('gulp-copy');
var bower = require('gulp-bower');
var sourcemaps = require('gulp-sourcemaps');



var config = {
    //Include all js files but exclude any min.js files
    src: ['bower_components/underscore/underscore-min.js',
        'bower_components/angular/angular.js',
        'bower_components/angular-animate/angular-animate.js',
        'bower_components/angular-route/angular-route.js',
        'bower_components/angular-spotify/src/*.js',
        'bower_components/angularUtils-pagination/dirPagination.js',
        //'Scripts/angular-virtual-scroll.js',
        'bower_components/ngstorage/ngStorage.min.js',
        'bower_components/angular-toastr/dist/angular-toastr.tpls.js',
        'bower_components/jquery/dist/jquery.js',
        'Scripts/bootstrap.js',

        'app/app.js',
        'app/config.js',
        //'!App/config.spotify.js',

        //uncomment below for production, comment for development
        'App/**/*.js',
        //end uncomment

        'App/**/*.directive.js'
    ],
    allBundle: 'Scripts/all.min.js',

    fontsout: 'Content',
    cssout: 'Content',
    scriptsout: 'Scripts'

}

gulp.task('clean', function () {
    return del([config.allBundle]);
});

gulp.task('scripts', ['clean'], function () {
    return gulp.src(config.src)
      .pipe(uglify())
      .pipe(concat('all.min.js'))
      .pipe(gulp.dest(config.scriptsout));
});




//Set a default tasks
gulp.task('default', ['scripts'], function () { });

gulp.task('watch', function () {
    return gulp.watch(config.src, ['scripts']);
});