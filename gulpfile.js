var gulp = require('gulp'),
    path = require('path'),
    base = __dirname,
    tmpDirFrontend = path.join(base, 'frontend', '.tmp'),
    tmpDirEmbed = path.join(base, 'embed', '.tmp'),
    distDir = path.join(base, 'dist'),
    config = require('./config'),
    failOnEslintError = 1;

gulp.eslint = require('gulp-eslint');
gulp.clean = require('gulp-clean');
gulp.sass = require('gulp-sass');
gulp.concat = require('gulp-concat');
gulp.rename = require('gulp-rename');
gulp.uglify = require('gulp-uglify');
gulp.minify = require('gulp-minify');
gulp.minifyCss = require('gulp-minify-css');
gulp.templateCache = require('gulp-angular-templatecache');
gulp.toSASSURI = require('gulp-svg-sass-uri');
gulp.runSequence = require('gulp-run-sequence');
gulp.replace = require('gulp-replace-task');
gulp.autoprefixer = require('gulp-autoprefixer');
gulp.watch = require('gulp-watch');
gulp.awspublish = require('gulp-awspublish');
gulp.cloudfront = require('gulp-cloudfront-invalidate');

gulp.task('watch', function () {
    return gulp.watch([
        path.join(base, 'frontend', 'app', '**', '*'),
        path.join(base, 'frontend', 'assets', '**', '*'),
        path.join(base, 'frontend', 'service-worker', '**', '*'),
        path.join(base, 'embed', 'app', '**', '*'),
        path.join(base, 'embed', 'assets', '**', '*'),
        path.join(base, 'vendor', '**', '*'),
        path.join(base, 'shared', '**', '*')
    ], function () {
        failOnEslintError = 0;
        gulp.runSequence('default:build');
    });
});

gulp.task('eslint', function () {
    var task = gulp.src([
        './gulpfile.js',
        './frontend/**/*.js',
        './embed/**/*.js',
        './shared/**/*.js',
        '!./**/vendor/**/*',
        '!./**/.tmp/**/*',
        '!./**/dist/**/*'
    ]).pipe(gulp.eslint({
        'ignore': false
    })).pipe(gulp.eslint.format());

    if (failOnEslintError) {
        task = task.pipe(gulp.eslint.failAfterError());
    }

    return task;
});

gulp.task('clean', function () {
    return gulp.src([
        tmpDirFrontend,
        tmpDirEmbed,
        distDir
    ], {'read': false}).pipe(gulp.clean());
});

gulp.task('svg:frontend', function () {
    return gulp.src(path.join(base, 'frontend/app/svg/**/*.svg'))
        .pipe(gulp.toSASSURI())
        .pipe(gulp.dest(tmpDirFrontend));
});

gulp.task('svg:embed', function () {
    return gulp.src(path.join(base, 'embed/app/svg/**/*.svg'))
        .pipe(gulp.toSASSURI())
        .pipe(gulp.dest(tmpDirEmbed));
});

gulp.task('svg', function (done) {
    gulp.runSequence(['svg:embed', 'svg:frontend'], done);
});

gulp.task('templates:frontend', function () {
    return gulp.src([
        path.join(base, 'shared/**/*.tpl.html'),
        path.join(base, 'frontend/app/**/*.tpl.html')
    ]).pipe(gulp.templateCache({
        'module': 'momentum',
        'transformUrl': function (url) {
            return path.basename(url);
        }
    })).pipe(gulp.dest(tmpDirFrontend));
});

gulp.task('templates:embed', function () {
    return gulp.src([
        path.join(base, 'shared/**/*.tpl.html'),
        path.join(base, 'embed/app/**/*.tpl.html')
    ]).pipe(gulp.templateCache({
        'module': 'momentum',
        'transformUrl': function (url) {
            return path.basename(url);
        }
    })).pipe(gulp.dest(tmpDirEmbed));
});

gulp.task('templates', function (done) {
    gulp.runSequence(['templates:embed', 'templates:frontend'], done);
});

gulp.task('concat:sass:frontend', function () {
    return gulp.src([
        path.join(tmpDirFrontend, 'svg.scss'),
        path.join(base, 'shared/**/*.scss'),
        path.join(base, 'frontend/app/app.scss'),
        path.join(base, 'frontend/app/**/*.scss')
    ]).pipe(gulp.concat('app.scss')).pipe(gulp.dest(tmpDirFrontend));
});

gulp.task('concat:sass:embed', function () {
    return gulp.src([
        path.join(tmpDirEmbed, 'svg.scss'),
        path.join(base, 'shared/**/*.scss'),
        path.join(base, 'embed/app/app.scss'),
        path.join(base, 'embed/app/**/*.scss')
    ]).pipe(gulp.concat('app.scss')).pipe(gulp.dest(tmpDirEmbed));
});

gulp.task('concat:sass', function (done) {
    gulp.runSequence(['concat:sass:frontend', 'concat:sass:embed'], done);
});

gulp.task('concat:js:frontend', function () {
    return gulp.src([
        path.join(base, 'vendor/material-design-lite/dist/material.js'),
        path.join(base, 'vendor/d3/d3.js'),
        path.join(base, 'vendor/nvd3/nvd3.js'),
        path.join(base, 'vendor/angular-chart/angular-chart.js'),
        path.join(base, 'vendor/fastclick/fastclick.js'),
        path.join(base, 'vendor/angular/angular.js'),
        path.join(base, 'vendor/angular-cookies/angular-cookies.js'),
        path.join(base, 'vendor/angular-ui-router/ui-router.js'),
        path.join(base, 'vendor/angular-payments/index.js'),
        path.join(base, 'vendor/angular-mdl/angular-material-design-lite.js'),
        path.join(base, 'vendor/angular-facebook/angular-facebook.js'),
        path.join(base, 'vendor/angular-angulartics/angulartics.min.js'),
        path.join(base, 'vendor/angular-angulartics/angulartics-ga.min.js'),
        path.join(base, 'vendor/angular-angulartics/angulartics-debug.min.js'),
        path.join(base, 'vendor/URI/uri.js'),
        path.join(base, 'frontend/app/app.js'),
        path.join(base, 'frontend/app/**/*.js'),
        path.join(tmpDirFrontend, 'templates.js'),
        path.join(base, 'shared/**/*.js')
    ]).pipe(gulp.concat('app.js')).pipe(gulp.dest(tmpDirFrontend));
});

gulp.task('concat:js:embed', function () {
    return gulp.src([
        path.join(base, 'vendor/material-design-lite/dist/material.js'),
        path.join(base, 'vendor/d3/d3.js'),
        path.join(base, 'vendor/nvd3/nvd3.js'),
        path.join(base, 'vendor/angular-chart/angular-chart.js'),
        path.join(base, 'vendor/fastclick/fastclick.js'),
        path.join(base, 'vendor/angular/angular.js'),
        path.join(base, 'vendor/angular-cookies/angular-cookies.js'),
        path.join(base, 'vendor/angular-ui-router/ui-router.js'),
        path.join(base, 'vendor/angular-mdl/angular-material-design-lite.js'),
        path.join(base, 'vendor/angular-facebook/angular-facebook.js'),
        path.join(base, 'vendor/angular-angulartics/angulartics.min.js'),
        path.join(base, 'vendor/angular-angulartics/angulartics-ga.min.js'),
        path.join(base, 'vendor/angular-angulartics/angulartics-debug.min.js'),
        path.join(base, 'vendor/URI/uri.js'),
        path.join(base, 'embed/app/app.js'),
        path.join(base, 'embed/app/**/*.js'),
        path.join(tmpDirEmbed, 'templates.js'),
        path.join(base, 'shared/**/*.js')
    ]).pipe(gulp.concat('app.js')).pipe(gulp.dest(tmpDirEmbed));
});

gulp.task('concat:js', function (done) {
    gulp.runSequence(['concat:js:embed', 'concat:js:frontend'], done);
});

gulp.task('sass:frontend', function () {
    return gulp.src(path.join(tmpDirFrontend, 'app.scss'))
        .pipe(gulp.sass({
            'includePaths': [
                path.join(base, 'vendor/material-design-lite/src/')
            ],
            'file': 'app.css'
        }).on('error', gulp.sass.logError))
        .pipe(gulp.autoprefixer(config.autoprefixer))
        .pipe(gulp.dest(tmpDirFrontend));
});

gulp.task('sass:embed', function () {
    return gulp.src(path.join(tmpDirEmbed, 'app.scss'))
        .pipe(gulp.sass({
            'includePaths': [
                path.join(base, 'vendor/material-design-lite/src/')
            ],
            'file': 'app.css'
        }).on('error', gulp.sass.logError))
        .pipe(gulp.autoprefixer(config.autoprefixer))
        .pipe(gulp.dest(tmpDirEmbed));
});

gulp.task('sass', function (done) {
    gulp.runSequence(['sass:embed', 'sass:frontend'], done);
});

gulp.task('copy:js:frontend', function () {
    return gulp.src(path.join(tmpDirFrontend, 'app.js'))
        .pipe(gulp.concat('app.js'))
        .pipe(gulp.dest(distDir));
});

gulp.task('copy:js:embed', function () {
    return gulp.src(path.join(tmpDirEmbed, 'app.js'))
        .pipe(gulp.concat('app.js'))
        .pipe(gulp.dest(path.join(distDir, 'embed')));
});

gulp.task('copy:js', function (done) {
    gulp.runSequence(['copy:js:embed', 'copy:js:frontend'], done);
});

gulp.task('copy:service-worker', function () {
    return gulp.src(path.join(base, 'frontend', 'service-worker', '**', '*'))
        .pipe(gulp.dest(path.join(distDir, 'service-worker')));
});

gulp.task('copy:css:frontend', function () {
    return gulp.src([
        path.join(base, 'vendor/material-design-lite/dist/material.css'),
        path.join(base, 'vendor/nvd3/nvd3.css'),
        path.join(tmpDirFrontend, 'app.css')
    ]).pipe(gulp.concat('app.css')).pipe(gulp.dest(distDir));
});

gulp.task('copy:css:embed', function () {
    return gulp.src([
        path.join(base, 'vendor/material-design-lite/dist/material.css'),
        path.join(base, 'vendor/nvd3/nvd3.css'),
        path.join(tmpDirEmbed, 'app.css')
    ]).pipe(gulp.concat('app.css'))
    .pipe(gulp.dest(path.join(distDir, 'embed')));
});

gulp.task('copy:css', function (done) {
    gulp.runSequence(['copy:css:embed', 'copy:css:frontend'], done);
});

gulp.task('copy:assets:frontend', function () {
    return gulp.src(path.join(base, 'frontend/assets/**'))
        .pipe(gulp.dest(distDir));
});
gulp.task('copy:assets:embed', function () {
    return gulp.src(path.join(base, 'embed/assets/**'))
        .pipe(gulp.dest(path.join(distDir, 'embed')));
});

gulp.task('copy:assets', function (done) {
    gulp.runSequence(['copy:assets:embed', 'copy:assets:frontend'], done);
});

gulp.task('copy:views:frontend', function () {
    return gulp.src(
        path.join(base, 'frontend', 'app', 'index.html')
    ).pipe(gulp.dest(distDir));
});

gulp.task('copy:views:embed', function () {
    return gulp.src(
        path.join(base, 'embed', 'app', 'index.html')
    ).pipe(gulp.dest(path.join(distDir, 'embed')));
});
gulp.task('copy:views', function (done) {
    gulp.runSequence(['copy:views:embed', 'copy:views:frontend'], done);
});

gulp.task('config:frontend', function () {
    return gulp.src(
        path.join(distDir, 'app.js')
    ).pipe(gulp.replace({
        'patterns': [{
            'match': 'bvConfig',
            'replacement': JSON.stringify(config)
                .replace(/\\/g, '\\\\')
        }]
    })).pipe(gulp.dest(distDir));
});

gulp.task('config:embed', function () {
    return gulp.src([
        path.join(distDir, 'embed', 'app.js'),
        path.join(distDir, 'embed', 'injector.js')
    ]).pipe(gulp.replace({
        'patterns': [{
            'match': 'bvConfig',
            'replacement': JSON.stringify(config)
                .replace(/\\/g, '\\\\')
        }]
    })).pipe(gulp.dest(path.join(distDir, 'embed')));
});

gulp.task('config', function (done) {
    gulp.runSequence(['config:embed', 'config:frontend'], done);
});

gulp.task('uglify:frontend', function () {
    return gulp.src(path.join(distDir, 'app.js'))
        .pipe(gulp.uglify())
        .pipe(gulp.dest(distDir));
});

gulp.task('uglify:embed:app', function () {
    return gulp.src([
        path.join(distDir, 'embed', 'app.js')
    ]).pipe(gulp.uglify())
    .pipe(gulp.dest(path.join(distDir, 'embed')));
});

gulp.task('uglify:embed:injector', function () {
    return gulp.src([
        path.join(distDir, 'embed', 'injector.js')
    ]).pipe(gulp.uglify())
    .pipe(gulp.dest(path.join(distDir, 'embed')));
});

gulp.task('uglify', function (done) {
    gulp.runSequence([
        'uglify:frontend',
        'uglify:embed:app',
        'uglify:embed:injector'
    ], done);
});

gulp.task('cssmin:frontend', function () {
    return gulp.src(path.join(distDir, 'app.css'))
        .pipe(gulp.minifyCss())
        .pipe(gulp.dest(distDir));
});

gulp.task('cssmin:embed', function () {
    return gulp.src(path.join(distDir, 'embed', 'app.css'))
        .pipe(gulp.minifyCss())
        .pipe(gulp.dest(path.join(distDir, 'embed')));
});

gulp.task('cssmin', function (done) {
    gulp.runSequence(['cssmin:embed', 'cssmin:frontend'], done);
});

gulp.task('invalidate-cloudfront', function () {
    var settings = {
        'distribution': process.env['AWS_DISTRIBUTION'],
        'paths': ['/*'],
        'accessKeyId': process.env['AWS_KEY'],
        'secretAccessKey': process.env['AWS_SECRET']
    };

    if (!settings.distribution) {
        return 1;
    }

    return gulp.src('*')
        .pipe(gulp.cloudfront(settings));
});

gulp.task('sync-s3', function () {
    var publisher = gulp.awspublish.create({
        'region': 'us-east-1',
        'accessKeyId': process.env['AWS_KEY'],
        'secretAccessKey': process.env['AWS_SECRET'],
        'params': {
            'Bucket': process.env['AWS_BUCKET']
        }
    });

    console.info('Deploy to ' + process.env['AWS_BUCKET']);

    return gulp.src(path.join(distDir, '**/*'))
        .pipe(publisher.publish())
        .pipe(publisher.sync())
        .pipe(gulp.awspublish.reporter());
});

gulp.task('copy', [
    'copy:js',
    'copy:css',
    'copy:assets',
    'copy:service-worker',
    'copy:views'
]);

gulp.task('build', ['clean'], function (done) {
    gulp.runSequence(['svg', 'templates'], 'concat:sass', 'concat:js', done);
});

gulp.task('dist', ['clean'], function (done) {
    gulp.runSequence(
        'build',
        'concat:sass',
        'sass',
        'copy',
        'config',
        done
    );
});

gulp.task('package', ['eslint'], function (done) {
    gulp.runSequence('dist', ['uglify', 'cssmin'], done);
});

gulp.task('deploy', function (done) {
    gulp.runSequence('package', 'sync-s3', 'invalidate-cloudfront', done);
});

gulp.task('default:build', ['eslint'], function () {
    return gulp.runSequence('dist');
});

gulp.task('default', ['eslint'], function () {
    return gulp.runSequence('default:build', 'watch');
});
