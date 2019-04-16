'use strict';

var gulp = require('gulp'),
    //sass = require('gulp-sass'),
    watch = require('gulp-watch'),
    //prefixer = require('gulp-autoprefixer'),
    //uglify = require('gulp-uglify'),
    //sourcemaps = require('gulp-sourcemaps'),
    cssmin = require('gulp-minify-css'),
    //imagemin = require('gulp-imagemin'),
    //pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    rigger = require('gulp-rigger'),
    //browserSync = require("browser-sync"),
    reload = browserSync.reload;


//
var path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: 'build/',
        js:   'build/js/',
        css:  'build/css/',
        img:  'build/images/',
        font: 'build/fonts/'
    },
    src: { //Пути откуда брать исходники
        html: 'dev/*.html',            //Синтаксис dev/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js:   'dev/js/chronoz.js',     //В стилях и скриптах нам понадобятся только main файлы
        scss: 'dev/scss/chronoz.scss',
        less: 'dev/less/chronoz.less',
        img:  'dev/images/**/*.*',     //Синтаксис images/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        font: 'dev/fonts/**/*.*'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: 'dev/**/*.html',
        js:   'dev/js/**/*.js',
        scss: 'dev/scss/**/*.scss',
        less: 'dev/less/**/*.less',
        img:  'dev/images/**/*.*',
        font: 'dev/fonts/**/*.*'
    },
    clean: './build'
};

//Создадим переменную с настройками нашего dev сервера:
var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "Frontend_Devil"
};

//Собираем html (gulp html:build)
gulp.task('html:build', function() {
    gulp.src(path.src.html)               //Выберем файлы по нужному пути
        .pipe(rigger())                   //Прогоним через rigger
        .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
        .pipe(reload({stream: true}));    //И перезагрузим наш сервер для обновлений
});

//Собираем javascript (gulp js:build)
gulp.task('js:build', function() {
    gulp.src(path.src.js)               //Найдем наш js-файл
        .pipe(rigger())                 //Прогоним через rigger
        .pipe(sourcemaps.init())        //Инициализируем sourcemap
        .pipe(uglify())                 //Сожмем наш js
        .pipe(sourcemaps.write())       //Пропишем карты
        .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
        .pipe(reload({stream: true}));  //И перезагрузим сервер
});

//Собираем стили (gulp scss:build)
gulp.task('scss:build', function() {
    gulp.src(path.src.scss)              //Выберем наш scss-файл
        .pipe(sourcemaps.init())         //Инициализируем sourcemap
        .pipe(sass())                    //Скомпилируем
        .pipe(prefixer())                //Добавим вендорные префиксы
        .pipe(cssmin())                  //Сожмем
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css)) //И в build
        .pipe(reload({stream: true}));   //И перезагрузим сервер
});

//Собираем картинки (gulp image:build)
gulp.task('image:build', function() {
    gulp.src(path.src.img)               //Выберем наши картинки
        .pipe(imagemin({                 //Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img)) //И бросим в build
        .pipe(reload({stream: true}));   //И перезагрузим сервер
});

//Шрифты (gulp font:build)
gulp.task('font:build', function() {
    gulp.src(path.src.font)
        .pipe(gulp.dest(path.build.font))
        .pipe(reload({stream: true}));   //И перезагрузим сервер
});

//Очистка (gulp clean)
gulp.task('clean', function(cb) {
    rimraf(path.clean, cb);
});

//Таск с именем «build», который будет запускать все (gulp build)
gulp.task('build', [
    'html:build',
    'js:build',
    'scss:build',
    'image:build',
    'font:build'
]);

//Веб сервер (gulp webserver)
gulp.task('webserver', function() {
    browsersync(config);
});

//Изменения файлов (gulp watch)
//Чтобы не лазить все время в консоль давайте попросим gulp каждый раз при изменении какого то файла запускать нужную задачу.
//Для этого напишет такой таск:
gulp.task('watch', function() {
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.scss], function(event, cb) {
        gulp.start('scss:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.font], function(event, cb) {
        gulp.start('font:build');
    });
});

//Дефолтный таск, который запускаут всю нашу сборку
gulp.task('default', ['clean', 'build', 'webserver', 'watch']);

//--------------------------------

var gulp         = require('gulp'), // Подключаем Gulp
    sass         = require('gulp-sass'), //Подключаем Sass пакет,
    cssnano      = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
    sourcemaps   = require('gulp-sourcemaps'),
    rename       = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
    browsersync  = require('browser-sync'), // Подключаем Browser Sync
    concat       = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
    uglify       = require('gulp-uglify'), // Подключаем gulp-uglifyjs (для сжатия JS)
    del          = require('del'), // Подключаем библиотеку для удаления файлов и папок
    imagemin     = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
    pngquant     = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
    cache        = require('gulp-cache'), // Подключаем библиотеку кеширования
    prefixer     = require('gulp-autoprefixer');// Подключаем библиотеку для автоматического добавления префиксов

gulp.task('less', function() {
    return gulp.src('dev/less/+(chronoz|theme).less')
        //return gulp.src('source-files')
        .pipe(less()) // Using gulp-less
        .pipe(prefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
        .pipe(gulp.dest('dev/css')); // Выгружаем результата в папку dev/css
});

gulp.task('sass', function(){ // Создаем таск Sass
    return gulp.src('dev/sass/chronoz.sass') // Берем источник
    //return gulp.src('dev/sass/**/*.sass') // Берем источник
        .pipe(sass()) // Преобразуем Sass в CSS посредством gulp-sass
        .pipe(prefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
        .pipe(gulp.dest('dev/css')) // Выгружаем результата в папку dev/css
        .pipe(browsersync.reload({stream: true})); // Обновляем CSS на странице при изменении
});

gulp.task('browser-sync', function() { // Создаем таск browser-sync
    browsersync({ // Выполняем browsersync
        server: { // Определяем параметры сервера
            baseDir: 'build' // Директория для сервера - dev
        },
        notify: false // Отключаем уведомления
    });
});

gulp.task('scripts', function() {
    return gulp.src([ // Берем все необходимые библиотеки
        'dev/libs/jquery/build/jquery.min.js', // Берем jQuery
        'dev/libs/magnific-popup/build/jquery.magnific-popup.min.js' // Берем Magnific Popup
    ])
        .pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
        .pipe(uglify()) // Сжимаем JS файл
        .pipe(gulp.dest('dev/js')); // Выгружаем в папку dev/js
});

gulp.task('css-libs', ['less', 'sass'], function() {
    return gulp.src('dev/css/+(platform|theme).css') // Выбираем файл для минификации
        .pipe(sourcemaps.init())
        .pipe(cssnano()) // Сжимаем
        .pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dev/css')); // Выгружаем в папку dev/css
});

gulp.task('watch', ['browser-sync', 'css-libs', 'scripts'], function() {
    gulp.watch('dev/less/**/*.less', ['less']); // Наблюдение за less файлами в папке less
    gulp.watch('dev/sass/**/*.sass', ['sass']); // Наблюдение за sass файлами в папке sass
    gulp.watch('dev/*.html', browsersync.reload); // Наблюдение за HTML файлами в корне проекта
    gulp.watch('dev/js/**/*.js', browsersync.reload);   // Наблюдение за JS файлами в папке js
});

gulp.task('clean', function() {
    return del.sync('build'); // Удаляем папку build перед сборкой
});

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

gulp.task('build', ['clean', 'img', 'less', 'sass', 'scripts'], function() {
    var buildCss = gulp.src([ // Переносим библиотеки в продакшен
        //'dev/css/platform.css',
        'dev/css/platform.min.css',
        //'dev/css/theme.css',
        'dev/css/theme.min.css'
    ])
        .pipe(gulp.dest('build/css'));

    var buildFonts = gulp.src('dev/fonts/**/*') // Переносим шрифты в продакшен
        .pipe(gulp.dest('build/fonts'));

    var buildJs = gulp.src('dev/js/**/*') // Переносим скрипты в продакшен
        .pipe(gulp.dest('build/js'));

    var buildHtml = gulp.src('dev/**/*.html') // Переносим HTML в продакшен
        .pipe(gulp.dest('build'));

    var buildPhp = gulp.src('dev/**/*.php') // Переносим PHP в продакшен
        .pipe(gulp.dest('build'));
});

gulp.task('clear', function (callback) {
    return cache.clearAll();
});

gulp.task('default', ['watch']);