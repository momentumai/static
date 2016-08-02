var gulp = require('gulp'),
    path = require('path'),
    base = __dirname,
    docBase,
    tmpDir,
    distDir,
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
        path.join(docBase, 'app', '**', '*'),
        path.join(docBase, 'assets', '**', '*'),
        path.join(base, 'vendor', '**', '*'),
        path.join(base, 'shared', '**', '*')
    ], function () {
        failOnEslintError = 0;
        gulp.start('default:build');
    });
});

gulp.task('watch:extension', function () {
    return gulp.watch([
        path.join(docBase, 'app', '**', '*'),
        path.join(docBase, 'assets', '**', '*'),
        path.join(docBase, 'chrome-background', '**', '*'),
        path.join(base, 'vendor', '**', '*'),
        path.join(base, 'shared', '**', '*')
    ], function () {
        failOnEslintError = 0;
        gulp.start('extension:build');
    });
});

gulp.task('eslint', function () {
    var task = gulp.src([
        './gulpfile.js',
        './frontend/**/*.js',
        './extension/**/*.js',
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
    return gulp.src([tmpDir, distDir], {'read': false})
        .pipe(gulp.clean());
});

gulp.task('svg', function () {
    return gulp.src(path.join(docBase, 'app/svg/**/*.svg'))
        .pipe(gulp.toSASSURI())
        .pipe(gulp.dest(tmpDir));
});

gulp.task('templates', function () {
    return gulp.src([
        path.join(base, 'shared/**/*.tpl.html'),
        path.join(docBase, 'app/**/*.tpl.html')
    ]).pipe(gulp.templateCache({
        'module': 'momentum',
        'transformUrl': function (url) {
            return path.basename(url);
        }
    })).pipe(gulp.dest(tmpDir));
});

gulp.task('concat:sass', function () {
    return gulp.src([
        path.join(tmpDir, 'svg.scss'),
        path.join(base, 'shared/**/*.scss'),
        path.join(docBase, 'app/app.scss'),
        path.join(docBase, 'app/**/*.scss')
    ]).pipe(gulp.concat('app.scss')).pipe(gulp.dest(tmpDir));
});

gulp.task('concat:js', function () {
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
        path.join(docBase, 'app/app.js'),
        path.join(docBase, 'app/**/*.js'),
        path.join(tmpDir, 'templates.js'),
        path.join(base, 'shared/**/*.js')
    ]).pipe(gulp.concat('app.js')).pipe(gulp.dest(tmpDir));
});

gulp.task('concat:background', function () {
    return gulp.src([
        path.join(docBase, 'chrome-background/vendor/bluebird/bluebird.js'),
        path.join(docBase, 'chrome-background/vendor/jquery/jquery.js'),
        path.join(docBase, 'chrome-background/vendor/URI/uri.js'),
        path.join(docBase, 'chrome-background/background.js')
    ]).pipe(gulp.concat('background.js')).pipe(gulp.dest(distDir));
});

gulp.task('sass', function () {
    return gulp.src(path.join(tmpDir, 'app.scss'))
        .pipe(gulp.sass({
            'includePaths': [
                path.join(
                    base,
                    'vendor/material-design-lite/src/'
                )
            ],
            'file': 'app.css'
        }).on('error', gulp.sass.logError))
        .pipe(gulp.autoprefixer(config.autoprefixer))
        .pipe(gulp.dest(tmpDir));
});

gulp.task('copy:js', function () {
    return gulp.src(path.join(tmpDir, 'app.js'))
        .pipe(gulp.concat('app.js'))
        .pipe(gulp.dest(distDir));
});

gulp.task('copy:css', function () {
    return gulp.src([
        path.join(
            base,
            'vendor/material-design-lite/dist/material.css'
        ),
        path.join(
            base,
            'vendor/nvd3/nvd3.css'
        ),
        path.join(tmpDir, 'app.css')
    ]).pipe(gulp.concat('app.css')).pipe(gulp.dest(distDir));
});

gulp.task('copy:assets', function () {
    return gulp.src(path.join(docBase, 'assets/**')).pipe(gulp.dest(distDir));
});

gulp.task('copy:views', function () {
    return gulp.src(
        path.join(docBase, 'app', 'index.html')
    ).pipe(gulp.dest(distDir));
});

gulp.task('config', function () {
    return gulp.src([
        path.join(distDir, 'app.js')
    ]).pipe(gulp.replace({
        'patterns': [{
            'match': 'bvConfig',
            'replacement': JSON.stringify(config)
                .replace(/\\/g, '\\\\')
        }]
    })).pipe(gulp.dest(distDir));
});

gulp.task('config:background', function () {
    return gulp.src([
        path.join(distDir, 'background.js')
    ]).pipe(gulp.replace({
        'patterns': [{
            'match': 'bvConfig',
            'replacement': JSON.stringify(config)
                .replace(/\\/g, '\\\\')
        }]
    })).pipe(gulp.dest(distDir));
});

gulp.task('uglify', function () {
    return gulp.src(path.join(distDir, 'app.js'))
        .pipe(gulp.uglify())
        .pipe(gulp.dest(distDir));
});

gulp.task('extension:uglify', function () {
    return gulp.src([
        path.join(distDir, 'background.js'),
        path.join(distDir, 'injector.js'),
        path.join(distDir, 'scripts.js')
    ]).pipe(gulp.uglify()).pipe(gulp.dest(distDir));
});

gulp.task('cssmin', function () {
    return gulp.src(path.join(distDir, 'app.css'))
        .pipe(gulp.minifyCss())
        .pipe(gulp.dest(distDir));
});

gulp.task('invalidate-cloudfront', function () {
    var settings = {
        'distribution': process.env['AWS_DISTRIBUTION'],
        'paths': ['/*']
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
    'copy:views'
]);

gulp.task('build', ['clean'], function (done) {
    gulp.runSequence(['svg', 'templates'], 'concat:sass', 'concat:js', done);
});

gulp.task('dist', ['clean'], function (done) {
    return gulp.runSequence(
        'build',
        'concat:sass',
        'sass',
        'copy',
        'config',
        done
    );
});

gulp.task('package', ['eslint'], function (done) {
    docBase = path.join(base, '/frontend/');
    tmpDir = path.join(docBase, '.tmp');
    distDir = path.join(docBase, 'dist');
    gulp.runSequence('dist', ['uglify', 'cssmin'], done);
});

gulp.task('deploy-frontend', function (done) {
    docBase = path.join(base, '/frontend/');
    tmpDir = path.join(docBase, '.tmp');
    distDir = path.join(docBase, 'dist');
    gulp.runSequence('package', 'sync-s3', 'invalidate-cloudfront', done);
});

gulp.task('extension:background', function (done) {
    gulp.runSequence('concat:background', 'config:background', done);
});

gulp.task('default:build', ['eslint'], function () {
    docBase = path.join(base, '/frontend/');
    tmpDir = path.join(docBase, '.tmp');
    distDir = path.join(docBase, 'dist');
    gulp.runSequence('dist');
});

gulp.task('default', ['eslint'], function () {
    gulp.runSequence('default:build', 'watch');
});

gulp.task('extension:build', function () {
    docBase = path.join(base, '/extension/');
    tmpDir = path.join(docBase, '.tmp');
    distDir = path.join(docBase, 'dist');
    gulp.runSequence('dist', 'extension:background');
});

gulp.task('extension', function () {
    gulp.runSequence('extension:build', 'watch:extension');
});

gulp.task('extension:package', function () {
    docBase = path.join(base, '/extension/');
    tmpDir = path.join(docBase, '.tmp');
    distDir = path.join(docBase, 'dist');
    gulp.runSequence(
        'dist',
        ['uglify', 'cssmin'],
        'extension:background',
        'extension:uglify'
    );
});
