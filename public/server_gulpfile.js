var gulp         = require('gulp'),
    sass         = require('gulp-sass'),
    browserSync  = require('browser-sync'),
    concat       = require('gulp-concat'),
    uglify       = require('gulp-uglifyjs'),
    cssnano      = require('gulp-cssnano'),
    rename       = require('gulp-rename'),
    del          = require('del'),
    imagemin     = require('gulp-imagemin'),
    pngquant     = require('imagemin-pngquant'),
    cache        = require('gulp-cache'),
    autoprefixer = require('gulp-autoprefixer'),
    pug          = require('gulp-pug'),
    connectPHP   = require('gulp-connect-php'),
    exec         = require('child_process').exec;

gulp.task('pug', function () {
    return gulp.src('public/src/*.pug')
        .pipe(pug())
        .pipe(gulp.dest('public/src'))
});



gulp.task('js', function () {
    return gulp.src('public/js/**/*.js')
        .pipe(gulp.dest('public/src/js'))
});


gulp.task('sass', function () {
    return gulp.src('public/src/sass/**/*.+(sass|scss)')
        .pipe(sass({outputStyle: 'extended'}).on('error', sass.logError))
        .pipe(autoprefixer(['last 2 versions'], { cascade: true }))
        .pipe(gulp.dest('public/src/css'))
        .pipe(gulp.dest('public/css'))
        .pipe(browserSync.reload({stream: true}))
});

gulp.task('scripts', function () {
    return gulp.src([
        'node_modules/jquery/dist/jquery.js',
        'node_modules/jquery-ui-dist/jquery-ui.js',
        'node_modules/jquery-ui-dist/jquery-ui.js',
        'node_modules/jquery-simplyscroll/jquery.simplyscroll.js'
        //'node_modules/magnific-popup/dist/jquery.magnific-popup.js',
        //'node_modules/select2/dist/js/select2.full.js',
        //'node_modules/select2/dist/js/i18n/ru.js',
        //'node_modules/jquery.scrollbar/jquery.scrollbar.js',
        //'node_modules/flickity/dist/flickity.pkgd.js',
        // 'node_modules/tether/dist/js/tether.js',
        // 'node_modules/bootstrap/dist/js/bootstrap.js',
        //'node_modules/slick-carousel/slick/slick.js'
    ])
        .pipe(concat('libs.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('public/src/js'))
        .pipe(gulp.dest('public/js'));

});

// gulp.task('common_scripts', function () {
//     return gulp.src([
//         'public/src/js/common.js'
//     ])
//         .pipe(concat('common.js'))
//         .pipe(gulp.dest('public/js'))
//         .pipe(browserSync.reload({stream: true}));
// });

gulp.task('css-libs', function () {
    return gulp.src([
        //'node_modules/flickity/dist/flickity.css',
        //'node_modules/jquery-ui/themes/base/slider.css',
        //'node_modules/magnific-popup/dist/magnific-popup.css',
        // 'node_modules/animate.css/animate.css',
        //npm install flickity --save-dev
        //'node_modules/slick-carousel/slick/slick.css',
        //'node_modules/slick-carousel/slick/slick-theme.css',
        //'node_modules/select2/dist/css/select2.css',
        //'node_modules/jquery.scrollbar/jquery.scrollbar.css',
        // 'node_modules/font-awesome/css/font-awesome.css'
        'node_modules/@fortawesome/fontawesome-free/css/fontawesome.css',
        'node_modules/jquery-simplyscroll/jquery.simplyscroll.css'
        // 'node_modules/bootstrap/dist/css/bootstrap.css',
        // 'node_modules/bootstrap/dist/css/bootstrap-grid.css'
    ])
        .pipe(concat('libs.min.css'))
        .pipe(cssnano())
        .pipe(gulp.dest('public/css'))
        .pipe(gulp.dest('public/src/css'));

});

gulp.task('browser-sync', function () {
    browserSync({
        server: {
            baseDir: 'public/src'
        },
        notify: false
    });
});

gulp.task('clean', function () {
    return del.sync('dist');
});

gulp.task('clear', function () {
    return cache.clearAll();
});

gulp.task('img', function () {
    return gulp.src('public/img/**/*')
        .pipe(cache(imagemin({
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            une: [pngquant()]
        })))
        .pipe(gulp.dest('dist/img'));
});

gulp.task('watch', ['browser-sync', 'pug', 'css-libs', 'js',  'scripts', 'onphp'], function () {
    gulp.watch('public/src/sass/**/*.+(sass|scss)', ['sass']);
    gulp.watch('public/src/**/*.pug', ['pug']);
    gulp.watch('public/src/css/*.css', browserSync.reload);
    gulp.watch('public/src/**/*.pug', browserSync.reload);
    gulp.watch('public/src/*.html', browserSync.reload);
    gulp.watch('public/js/**/*.js', ['js'], browserSync.reload);
    gulp.watch('resources/views/**/*.php', browserSync.reload);
    gulp.watch('resources/views/**/*.php', ['onphp']);
});

gulp.task('build', ['clean', 'img', 'pug', 'sass', 'css-libs',  'scripts'], function () {

    var buildCss = gulp.src([
        'css/main.css',
        'css/libs.min.css',
        'src/css/main.css',
        'src/css/libs.min.css'
    ])
        .pipe(gulp.dest('dist/css'));

    var buildFonts = gulp.src('src/fonts/**/*')
        .pipe(gulp.dest('dist/fonts'));

    var buildJs = gulp.src('src/js/**/*')
        .pipe(gulp.dest('dist/js'));

    var buildHtml = gulp.src('src/*.html')
        .pipe(gulp.dest('dist'));

    var buildImages = gulp.src('src/images/**/*')
        .pipe(gulp.dest('dist/images'));

});

gulp.task('php', function () {
    connectPHP.server({
        keepalive: true,
        hostname: 'http://127.0.0.1:8080',
        open: false
    });
});

gulp.task('onphp', function () {
    gulp.src('resources/views/**/*.php')
        .pipe(browserSync.reload({stream: true})); // перезагружаем после изменения в файлах php
    exec('php artisan serve --port=8080', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        //cb(err);
    });
    exec('php artisan view:clear', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        //cb(err);
    });
    exec('php artisan cache:clear', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        //cb(err);
    });
});

gulp.task('default', ['watch', 'browserSync', 'php']);