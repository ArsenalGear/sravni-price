var autoprefixer = require('gulp-autoprefixer'),
    browserSync  = require('browser-sync'),
    cache        = require('gulp-cache'),
    concat       = require('gulp-concat'),
    cssnano      = require('gulp-cssnano'),
    del          = require('del'),
    gulp         = require('gulp'),
    htmlbeautify = require('gulp-html-beautify'),
    imagemin     = require('gulp-imagemin'),
    notify       = require('gulp-notify'),
    plumber      = require('gulp-plumber'),
    // pngquant     = require('imagemin-pngquant'),
    pug          = require('gulp-pug'),
    sass         = require('gulp-sass'),
	typograf     = require('gulp-typograf'),
    uglify       = require('gulp-uglifyjs'),
    connectPHP   = require('gulp-connect-php'),
    exec         = require('child_process').exec;

gulp.task('pug', function () {
    return gulp.src('public/pug/*.pug')
        .pipe(plumber({
            errorHandler: notify.onError()
        }))
        .pipe(pug())
        .pipe(htmlbeautify({
            indentSize: 2,
            unformatted: [
                'abbr', 'area', 'b', 'bdi', 'bdo', 'br', 'cite',
                'code', 'data', 'datalist', 'del', 'dfn', 'em', 'embed', 'i', 'ins', 'kbd', 'keygen', 'map', 'mark', 'math', 'meter', 'noscript',
                'object', 'output', 'progress', 'q', 'ruby', 's', 'samp', 'small',
                'strong', 'sub', 'sup', 'template', 'time', 'u', 'var', 'wbr', 'text',
                'acronym', 'address', 'big', 'dt', 'ins', 'strike', 'tt'
            ]
        }))
		.pipe(typograf({ locale: ['ru', 'en-US'] }))
        .pipe(gulp.dest('public'))
});

gulp.task('scss', function () {
    return gulp.src('public/scss/**/*.scss')
        .pipe(sass({outputStyle: 'extended'}).on('error', sass.logError))
        .pipe(autoprefixer(['> 1%', 'last 2 versions', 'IE 11'], { cascade: true }))
        .pipe(gulp.dest('public/css'))
        .pipe(browserSync.reload({stream: true}))
});

gulp.task('js-libs', function () {
    return gulp.src([
        'node_modules/jquery/dist/jquery.js',
        // 'node_modules/tether/dist/js/tether.js',
        // 'node_modules/bootstrap/dist/js/bootstrap.js',
        'node_modules/jquery.maskedinput/src/jquery.maskedinput.js',
        // 'node_modules/jquery.scrollbar/jquery.scrollbar.js',
        'node_modules/magnific-popup/dist/jquery.magnific-popup.js',
		// 'node_modules/jquery-ui/ui/widgets/datepicker.js',
		// 'node_modules/jquery-ui/ui/widgets/slider.js',
		// 'node_modules/jquery-ui/ui/i18n/datepicker-ru.js',
        // './src/libs/share42.custom/share42.custom.min.js',
        // './src/js/jq-ui-slider/jquery-ui.min.js', //datepicker + slider
		// 'node_modules/timepicker/jquery.timepicker.js',
        'node_modules/select2/dist/js/select2.full.js',
        // 'node_modules/jquery-ui-touch-punch/jquery.ui.touch-punch.js',
        // 'node_modules/select2/dist/js/i18n/ru.js',
        'node_modules/slick-carousel/slick/slick.js'
    ])
        .pipe(concat('libs.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('public/js'));
});

gulp.task('css-libs', function () {
    return gulp.src([
        'node_modules/bootstrap/dist/css/bootstrap-grid.css',
        // 'node_modules/jquery.scrollbar/jquery.scrollbar.css',
        // './src/css/jq-ui-slider/jquery-ui.min.css', //datepicker + slider
        // './src/css/fonts/all.css', //datepicker + slider
        'node_modules/magnific-popup/dist/magnific-popup.css',
        // 'node_modules/jquery-ui/themes/base/datepicker.css',
        // 'node_modules/jquery-ui/themes/base/slider.css',
        // 'node_modules/jquery-ui/themes/base/theme.css',
        // 'node_modules/timepicker/jquery.timepicker.css',
        'node_modules/select2/dist/css/select2.css',
        'node_modules/slick-carousel/slick/slick.css',
        'node_modules/slick-carousel/slick/slick-theme.css'
    ])
        .pipe(concat('libs.min.css'))
        .pipe(cssnano())
        .pipe(gulp.dest('public/css'));
});

gulp.task('browser-sync', function () {
    browserSync.init({
        server: {
            baseDir: 'public'
        },
        online: true,
        // tunnel: true,
        notify: false
    });
});

gulp.task('clean', function () {
    return del.sync('public/dist');
});

gulp.task('clear', function () {
    return cache.clearAll();
});

gulp.task('img', function () {
    return gulp.src('public/img/**/*')
        .pipe(cache(imagemin({
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}]
        })))
        .pipe(gulp.dest('public/dist/img'));
});

gulp.task('watch', ['browser-sync', 'pug', 'scss', 'css-libs', 'js-libs'], function () {
    gulp.watch('public/scss/**/*.+(sass|scss)', ['scss']);
    gulp.watch('public/**/*.pug', ['pug']);
    // gulp.watch('src/css/*.css', browserSync.reload);
    gulp.watch('public/*.html', browserSync.reload);
    gulp.watch('public/js/**/*.js', browserSync.reload);
    gulp.watch('resources/views/**/*.php', browserSync.reload);
    gulp.watch('resources/views/**/*.php', ['onphp']);
});

gulp.task('build', ['clean', 'img', 'pug', 'scss', 'css-libs', 'js-libs',  'onphp'], function () {

    var buildCss = gulp.src('public/css/**/*')
        .pipe(gulp.dest('public/dist/css'));

    var buildFonts = gulp.src('public/fonts/**/*')
        .pipe(gulp.dest('public/dist/fonts'));

    var buildJs = gulp.src('public/js/**/*')
        .pipe(gulp.dest('public/dist/js'));

    var buildHtml = gulp.src('public/*.html')
        .pipe(gulp.dest('public/dist'));

    var buildImages = gulp.src('public/images/**/*')
        .pipe(gulp.dest('public/dist/images'));

});


gulp.task('php', function () {
    console.log('12');
    connectPHP.server({
        keepalive: true,
        hostname: 'http://127.0.0.1:8085',
        open: false
    });
});

gulp.task('onphp', function () {
    gulp.src('resources/views/**/*.php')
        .pipe(browserSync.reload({stream: true})); // перезагружаем после изменения в файлах php
    exec('sudo docker-compose exec app php artisan serve --host=0.0.0.0 --port=8000', function (err, stdout, stderr) {
        console.log(stdout);
        // console.log(stderr);
        //cb(err);
    });
    exec('sudo docker-compose exec app php artisan view:clear', function (err, stdout, stderr) {
        console.log(stdout);
        // console.log(stderr);
        //cb(err);
    });
    exec('sudo docker-compose exec app php artisan cache:clear', function (err, stdout, stderr) {
        console.log(stdout);
        // console.log(stderr);
        //cb(err);
    });
});

gulp.task('default', ['watch', 'browserSync', 'php']);
