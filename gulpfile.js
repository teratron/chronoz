'use strict';

let gulp         = require('gulp'),              // Подключаем Gulp
    sass         = require('gulp-sass'),         // Подключаем Sass пакет,
    //less         = require('gulp-less'),         // Подключаем Less пакет,
    cssnano      = require('gulp-cssnano'),      // Подключаем пакет для минификации CSS
    cssmin       = require('gulp-minify-css'),   //
    htmlmin      = require('gulp-htmlmin'),      //
    sourcemaps   = require('gulp-sourcemaps'),   //
    rename       = require('gulp-rename'),       // Подключаем библиотеку для переименования файлов
    concat       = require('gulp-concat'),       // Подключаем gulp-concat (для конкатенации файлов/собирает воедино)
    uglify       = require('gulp-uglify'),       // Подключаем gulp-uglify (для сжатия JS)
    imagemin     = require('gulp-imagemin'),     // Подключаем библиотеку для работы с изображениями
    pngquant     = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
    rigger       = require('gulp-rigger'),       //= test.html //= test.js /*= includes/test.css */
    rimraf       = require('rimraf'),            // The UNIX command rm -rf for node
    del          = require('del'),               // Подключаем библиотеку для удаления файлов и папок
    cache        = require('gulp-cache'),        // Подключаем библиотеку кеширования
    prefixer     = require('gulp-autoprefixer'), // Подключаем библиотеку для автоматического добавления префиксов
    watch        = require('gulp-watch'),
    browsersync  = require('browser-sync'),      // Подключаем Browser Sync
    reload       = browsersync.reload;

// Пути
let path = {
    build: { // Тут мы укажем куда складывать готовые после сборки файлы
        html: 'build/',
        js:   'build/js/',
        css:  'build/css/',
        img:  'build/images/',
        font: 'build/fonts/'
    },
    src: { // Пути откуда брать исходники
        html: 'dev/*.html',            // Синтаксис dev/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js:   'dev/js/chronoz.js',     // В стилях и скриптах нам понадобятся только main файлы
        scss: 'dev/scss/chronoz.scss', // dev/sass/**/*.sass
        less: 'dev/less/chronoz.less',
        img:  'dev/images/**/*.*',     // Синтаксис images/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        font: 'dev/fonts/**/*.*'
    },
    watch: { // Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: 'dev/**/*.html',
        js:   'dev/js/**/*.js',
        scss: 'dev/scss/**/*.scss',
        less: 'dev/less/**/*.less',
        img:  'dev/images/**/*.*',
        font: 'dev/fonts/**/*.*'
    },
    clean: './build'
};

// Создадим переменную с настройками нашего dev сервера:
let config = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "Frontend_Devil"
};

// Собираем html (gulp html:build)
gulp.task('html:build', function() {
    gulp.src(path.src.html)               // Выберем файлы по нужному пути
        .pipe(rigger())                   // Прогоним через rigger
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(path.build.html)) // Выплюнем их в папку build
        .pipe(reload({stream: true}));    // И перезагрузим наш сервер для обновлений
});

// Собираем javascript (gulp js:build)
gulp.task('js:build', function() {
    gulp.src(path.src.js)               // Найдем наш js-файл
        .pipe(rigger())                 // Прогоним через rigger
        .pipe(sourcemaps.init())        // Инициализируем sourcemap
        .pipe(uglify())                 // Сожмем наш js
        .pipe(sourcemaps.write())       // Пропишем карты
        .pipe(gulp.dest(path.build.js)) // Выплюнем готовый файл в build
        .pipe(reload({stream: true}));  // И перезагрузим сервер
});

// Собираем стили (gulp scss:build)
gulp.task('scss:build', function() {
    gulp.src(path.src.scss)              // Выберем наш scss-файл
        .pipe(sourcemaps.init())         // Инициализируем sourcemap
        .pipe(sass())                    // Скомпилируем
        .pipe(prefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: true}))                // Добавим вендорные префиксы
        .pipe(cssmin())                  // Сожмем
        //.pipe(cssnano())                 // Сожмем
        //.pipe(rev())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css)) // И в build
        .pipe(reload({stream: true}));   // И перезагрузим сервер
});

// Собираем картинки (gulp image:build)
gulp.task('image:build', function() {
    gulp.src(path.src.img)               // Выберем наши картинки
        .pipe(imagemin({                 // Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img)) // И бросим в build
        .pipe(reload({stream: true}));   // И перезагрузим сервер
});

// Шрифты (gulp font:build)
gulp.task('font:build', function() {
    gulp.src(path.src.font)
        .pipe(gulp.dest(path.build.font))
        .pipe(reload({stream: true}));   // И перезагрузим сервер
});

// Очистка кэша (gulp clear)
gulp.task('clear', function() {
    return cache.clearAll();
});

// Очистка (gulp clean)
gulp.task('clean', function(callback) {
    return rimraf(path.clean, callback);
});

// Таск с именем «build», который будет запускать все (gulp build)
gulp.task('build', [
    'html:build',
    'js:build',
    'scss:build',
    'image:build',
    'font:build'
]);

// Веб сервер (gulp webserver)
gulp.task('webserver', function() {
    browsersync(config);
});

// Изменения файлов (gulp watch)
// Чтобы не лазить все время в консоль давайте попросим gulp каждый раз при изменении какого то файла запускать нужную задачу.
// Для этого напишет такой таск:
gulp.task('watch', function() {
    watch([path.watch.html], function(event, callback) {
        gulp.start('html:build');
    });
    watch([path.watch.js], function(event, callback) {
        gulp.start('js:build');
    });
    watch([path.watch.scss], function(event, callback) {
        gulp.start('scss:build');
    });
    watch([path.watch.img], function(event, callback) {
        gulp.start('image:build');
    });
    watch([path.watch.font], function(event, callback) {
        gulp.start('font:build');
    });
});

// Дефолтный таск, который запускаут всю нашу сборку (gulp)
gulp.task('default', ['clean', 'build', 'webserver', 'watch']);

//--------------------------------


/*
gulp.task('sass', function(){ // Создаем таск Sass
    return gulp.src('dev/sass/chronoz.sass') // Берем источник
        //return gulp.src('dev/sass/!**!/!*.sass') // Берем источник
        .pipe(sass()) // Преобразуем Sass в CSS посредством gulp-sass
        .pipe(prefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
        .pipe(gulp.dest('dev/css')) // Выгружаем результата в папку dev/css
        .pipe(browsersync.reload({stream: true})); // Обновляем CSS на странице при изменении
});

gulp.task('less', function() {
    return gulp.src('dev/less/+(chronoz|theme).less')
        //return gulp.src('source-files')
        .pipe(less()) // Using gulp-less
        .pipe(prefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
        .pipe(gulp.dest('dev/css')); // Выгружаем результата в папку dev/css
});*/



/*gulp.task('browser-sync', function() { // Создаем таск browser-sync
    browsersync({ // Выполняем browsersync
        server: { // Определяем параметры сервера
            baseDir: 'build' // Директория для сервера - dev
        },
        notify: false // Отключаем уведомления
    });
});*/

/*gulp.task('scripts', function() {
    return gulp.src([ // Берем все необходимые библиотеки
        'dev/libs/jquery/build/jquery.min.js', // Берем jQuery
        'dev/libs/magnific-popup/build/jquery.magnific-popup.min.js' // Берем Magnific Popup
    ])
        .pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
        .pipe(uglify()) // Сжимаем JS файл
        .pipe(gulp.dest('dev/js')); // Выгружаем в папку dev/js
});*/

gulp.task('css-libs', ['less', 'sass'], function() {
    return gulp.src('dev/css/+(platform|theme).css') // Выбираем файл для минификации
        .pipe(sourcemaps.init())
        .pipe(cssnano()) // Сжимаем
        .pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dev/css')); // Выгружаем в папку dev/css
});

/*
gulp.task('watch', ['browser-sync', 'css-libs', 'scripts'], function() {
    gulp.watch('dev/less/!**!/!*.less', ['less']); // Наблюдение за less файлами в папке less
    gulp.watch('dev/sass/!**!/!*.sass', ['sass']); // Наблюдение за sass файлами в папке sass
    gulp.watch('dev/!*.html', browsersync.reload); // Наблюдение за HTML файлами в корне проекта
    gulp.watch('dev/js/!**!/!*.js', browsersync.reload);   // Наблюдение за JS файлами в папке js
});

gulp.task('clean', function() {
    return del.sync('build'); // Удаляем папку build перед сборкой
});
*/

gulp.task('img', function() {
    return gulp.src('dev/images/**/*') // Берем все изображения из dev
        .pipe(cache(imagemin({ // С кешированием
            // .pipe(imagemin({ // Сжимаем изображения без кеширования
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))/**/)
        .pipe(gulp.dest('build/images')); // Выгружаем на продакшен
});

/*gulp.task('build', ['clean', 'img', 'less', 'sass', 'scripts'], function() {
    let buildCss = gulp.src([ // Переносим библиотеки в продакшен
        //'dev/css/platform.css',
        'dev/css/platform.min.css',
        //'dev/css/theme.css',
        'dev/css/theme.min.css'
    ])
        .pipe(gulp.dest('build/css'));

    let buildFonts = gulp.src('dev/fonts/!**!/!*') // Переносим шрифты в продакшен
        .pipe(gulp.dest('build/fonts'));

    let buildJs = gulp.src('dev/js/!**!/!*') // Переносим скрипты в продакшен
        .pipe(gulp.dest('build/js'));

    let buildHtml = gulp.src('dev/!**!/!*.html') // Переносим HTML в продакшен
        .pipe(gulp.dest('build'));

    let buildPhp = gulp.src('dev/!**!/!*.php') // Переносим PHP в продакшен
        .pipe(gulp.dest('build'));
});*/


