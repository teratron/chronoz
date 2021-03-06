'use strict';

const gulp = require('gulp');              // Подключаем Gulp
const sass = require('gulp-sass');         // Подключаем Sass пакет,
const less = require('gulp-less');         // Подключаем Less пакет,
const babel = require('gulp-babel');
const purgecss = require('gulp-purgecss');
const cssnano = require('gulp-cssnano');      // Подключаем пакет для минификации CSS
const autoprefixer = require('gulp-autoprefixer'); // Подключаем библиотеку для автоматического добавления префиксов
const htmlmin = require('gulp-htmlmin');      //
const sourcemaps = require('gulp-sourcemaps');   //
const rename = require('gulp-rename');       // Подключаем библиотеку для переименования файлов
const concat = require('gulp-concat');       // Подключаем gulp-concat (для конкатенации файлов/собирает воедино)
const uglify = require('gulp-uglify');       // Подключаем gulp-uglify (для сжатия JS)
const imagemin = require('gulp-imagemin');     // Подключаем библиотеку для работы с изображениями
const pngquant = require('imagemin-pngquant'); // Подключаем библиотеку для работы с png
const rigger = require('gulp-rigger');       //= test.html //= test.js /*= includes/test.css */
const del = require('del');               // Подключаем библиотеку для удаления файлов и папок
const cache = require('gulp-cache');        // Подключаем библиотеку кеширования
const watch = require('gulp-watch');
const browserSync = require('browser-sync');      // Подключаем Browser Sync
const reload = browserSync.reload;
const {phpMinify} = require('@cedx/gulp-php-minify');

// Настройки проекта
let project = {
    name: 'chronoz',
    ver: '0.0.1'
};

// Пути проекта
let dist = 'dist';
let orgn = 'src';
let path = {
    build: { // Тут мы укажем куда складывать готовые после сборки файлы
        js: dist + '/js/',
        css: dist + '/css/',
        img: dist + '/images/',
        font: dist + '/fonts/'
    },
    dev: { // Пути откуда брать исходники
        php: orgn + '/**/*.php',
        html: orgn + '/**/*.html',                      // Синтаксис dev/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js: orgn + '/js/' + project.name + '.js',   // В стилях и скриптах нам понадобятся только main файлы
        scss: orgn + '/scss/' + project.name + '.scss', // dev/sass/**/*.sass
        less: orgn + '/less/' + project.name + '.less',
        css: orgn + '/css/',
        img: orgn + '/images/**/*.+(png|gif|jpg|svg)', // Синтаксис images/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        font: orgn + '/fonts/**/*.+(ttf|woff|woff2|eot|otf|svg)'
    },
    watch: { // Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        php: orgn + '/**/*.php',
        html: orgn + '/**/*.html',
        js: orgn + '/js/**/*.js',
        css: orgn + '/css/**/*.css',
        scss: orgn + '/scss/**/*.scss',
        less: orgn + '/less/**/*.less',
        img: orgn + '/images/**/*.*',
        font: orgn + '/fonts/**/*.*'
    }
};

// Создадим переменную с настройками нашего dev сервера:
let config = {
    server: {
        baseDir: dist
    },
    host: 'localhost',
    port: 9000,
    logPrefix: project.name,
    tunnel: true,
    notify: false
};

// Собираем php
gulp.task('php:build', function () {
    return gulp.src(path.dev.php, {read: false}) // Выберем файлы по нужному пути
        .pipe(phpMinify({silent: true}))         // Сожмем
        .pipe(gulp.dest(dist))                   // Выплюнем их в папку build
        .pipe(reload({stream: true}));           // И перезагрузим наш сервер для обновлений
});

// Собираем html
gulp.task('html:build', function () {
    return gulp.src([path.dev.html, '!' + orgn + '/scss/**/*.html', '!' + orgn + '/less/**/*.html']) // Выберем файлы по нужному пути
        .pipe(rigger())                   // Прогоним через rigger
        .pipe(htmlmin({ // Сожмем
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true,
            minifyURLs: true,
            removeComments: true,
            removeEmptyAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true
        }))
        .pipe(gulp.dest(dist))            // Выплюнем их в папку build
        .pipe(reload({stream: true}));    // И перезагрузим наш сервер для обновлений
});

// Собираем javascript
gulp.task('js:build', () => {
    return gulp.src(path.dev.js)        // Найдем наш js-файл
        .pipe(babel({presets: ['@babel/env']}))
        .pipe(rigger())                 // Прогоним через rigger
        .pipe(sourcemaps.init())        // Инициализируем sourcemap
        .pipe(uglify())                 // Сожмем наш js
        .pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
        .pipe(sourcemaps.write('.'))    // Пропишем карты
        .pipe(gulp.dest(path.build.js)) // Выплюнем готовый файл в build
        .pipe(reload({stream: true}));  // И перезагрузим сервер
});

// Собираем стили
gulp.task('scss:dev', () => {
    del(path.dev.css + '**/*.css', {force: true});
    return gulp
        .src(path.dev.scss)              // Выберем наш scss-файл
        .pipe(sass())                    // Скомпилируем
        //.pipe(purgecss({content: [path.dev.html]}))
        .pipe(autoprefixer({             // Добавим вендорные префиксы
            browsers: ['last 15 versions', '> 1%', 'ie 8', 'ie 7'],
            cascade: true
        }))
        //.pipe(cssnano())                  // Сожмем
        //.pipe(rename({suffix: '.min'}))   // Добавляем суффикс .min
        //.pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.dev.css));  // И в build
});

gulp.task('scss:build', function () {
    return gulp
        .src(path.dev.scss)               // Выберем наш scss-файл
        .pipe(sourcemaps.init())          // Инициализируем sourcemap
        .pipe(sass())                     // Скомпилируем
        .pipe(purgecss({content: [path.dev.html]}))
        .pipe(autoprefixer({browsers: ['last 15 versions', '> 1%', 'ie 8', 'ie 7'], cascade: true})) // Добавим вендорные префиксы
        .pipe(cssnano())                  // Сожмем
        .pipe(rename({suffix: '.min'}))   // Добавляем суффикс .min
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.build.css)); // И в build
});

function RunGulpSass(src, dest) {
    return gulp.watch(watch, function () {
        return gulp
            .src(src)               // Выберем наш scss-файл
            .pipe(sourcemaps.init())          // Инициализируем sourcemap
            .pipe(sass())                     // Скомпилируем
            .pipe(purgecss({content: [path.dev.html]}))
            .pipe(autoprefixer({              // Добавим вендорные префиксы
                browsers: ['last 15 versions', '> 1%', 'ie 8', 'ie 7'],
                cascade: true
            }))
            .pipe(cssnano())                  // Сожмем
            .pipe(rename({suffix: '.min'}))   // Добавляем суффикс .min
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest(path.build.css)); // И в build
    });
}

// Собираем картинки
gulp.task('image:build', function () {
    return gulp.src(path.dev.img)        // Выберем наши картинки
        .pipe(cache(imagemin({           // Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        })))
        .pipe(gulp.dest(path.build.img)) // И бросим в build
        .pipe(reload({stream: true}));   // И перезагрузим сервер
});

// Шрифты
gulp.task('font:build', function () {
    return gulp.src(path.dev.font)
        .pipe(gulp.dest(path.build.font))
        .pipe(reload({stream: true}));   // И перезагрузим сервер
});

// Очистка кэша
gulp.task('clear', function () {
    return cache.clearAll();
});

// Удаляем папку build
gulp.task('clean', function () {
    return del(dist, {force: true});
});

// Таск с именем «build», который буsдет запускать все
gulp.task('build', gulp.parallel('php:build', 'html:build', 'js:build', 'scss:build', 'image:build', 'font:build', function () {
    return gulp.src(orgn + '/*.ico')   // Выберем файлы по нужному пути
        .pipe(gulp.dest(dist))         // Выплюнем их в папку build
        .pipe(reload({stream: true})); // И перезагрузим сервер
}));

// Веб сервер
gulp.task('webserver', function () {
    browserSync(config);
});

// Изменения файлов
// Чтобы не лазить все время в консоль давайте попросим gulp каждый раз при изменении какого то файла запускать нужную задачу.
// Для этого напишет такой таск:
gulp.task('watch', function () {
    watch([path.watch.html], function () {
        return gulp.start('html:build');
    });
    watch([path.watch.js], function () {
        return gulp.start('js:build');
    });
    watch([path.watch.scss], function () {
        return gulp.start('scss:build');
    });
    watch([path.watch.img], function () {
        return gulp.start('image:build');
    });
    watch([path.watch.font], function () {
        return gulp.start('font:build');
    });
});

// Дефолтный таск, который запускаут всю нашу сборку
gulp.task('default', gulp.series('clean', 'clear', 'build', 'webserver', 'watch'));

//----------------------------------------------------

// Load plugins
/*const gulp = require("gulp");

// import tasks
const img = require("./gulp-tasks/images.js");
const js = require("./gulp-tasks/scripts.js");
const server = require("./gulp-tasks/browsersync.js");
const css = require("./gulp-tasks/styles.js");
const clean = require("./gulp-tasks/clean.js");
const eleventy = require("./gulp-tasks/eleventy.js");
const copy = require("./gulp-tasks/copy.js");

// Watch files
function watchFiles() {
    gulp.watch("./src/assets/scss/!**!/!*", css.build);
    gulp.watch("./src/assets/js/!**!/!*", gulp.series(js.lint, js.build));
    gulp.watch("./src/assets/img/!**!/!*", gulp.series(img.resize, copy.assets));
    gulp.watch("./src/assets/fonts/!**!/!*", copy.assets);
    gulp.watch(
        [
            "./.eleventy.js",
            "./.eleventyignore",
            "./src/!*",
            "./src/_data/!**!/!*",
            "./src/_includes/!**!/!*",
            "./src/blogposts/!**!/!*",
            "./src/pages/!**!/!*",
            "./src/projects/!**!/!*"
        ],
        eleventy.build
    );
}

// define tasks
const watch = gulp.parallel(watchFiles, server.init);
const build = gulp.series(
    clean.dist,
    img.optimise,
    gulp.parallel(
        copy.assets,
        css.build,
        img.resize,
        eleventy.build,
        gulp.series(js.lint, js.build)
    )
);

// expose tasks to CLI
exports.build = build;
exports.watch = watch;
exports.default = build;*/
//----------------------------------------------------

/*
var gulp = require("gulp"),
    sass = require("gulp-sass"),
    postcss = require("gulp-postcss"),
    autoprefixer = require("autoprefixer"),
    cssnano = require("cssnano");

function runGulpSass(src,dest,watch) {
    gulp.watch(watch, function() {
        return gulp.src(src)
            .pipe(sass())
            .on("error", sass.logError)
            .pipe(postcss([autoprefixer(), cssnano()]))
            .pipe(gulp.dest(dest))
    });
}

exports.runGulpSass = runGulpSass;

function startGulp() {
    var paths = ["slider-one","slider-two"];
    for(var i=0;i<paths.length;i++) {
        runGulpSass("scss/"+paths[i]+"/index.scss",paths[i],"scss/"+paths[i]+"/!*.scss")
    }
}

exports.watch = startGulp;*/
//----------------------------------------------------


/*
gulp.task('sass', function(){ // Создаем таск Sass
    return gulp.src('dev/sass/chronoz.sass') // Берем источник
        //return gulp.src('dev/sass/!**!/!*.sass') // Берем источник
        .pipe(sass()) // Преобразуем Sass в CSS посредством gulp-sass
        .pipe(prefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
        .pipe(gulp.dest('dev/css')) // Выгружаем результата в папку dev/css
        .pipe(browserSync.reload({stream: true})); // Обновляем CSS на странице при изменении
});

gulp.task('less', function() {
    return gulp.src('dev/less/+(chronoz|theme).less')
        //return gulp.src('source-files')
        .pipe(less()) // Using gulp-less
        .pipe(prefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
        .pipe(gulp.dest('dev/css')); // Выгружаем результата в папку dev/css
});*/


/*gulp.task('browser-sync', function() { // Создаем таск browser-sync
    browserSync({ // Выполняем browserSync
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
        .pipe(concat('bundle.min.js')) // Собираем их в кучу в новом файле libs.min.js
        .pipe(uglify()) // Сжимаем JS файл
        .pipe(gulp.dest('dev/js')); // Выгружаем в папку dev/js
});*/

/*gulp.task('css-libs', ['less', 'sass'], function() {
    return gulp.src('dev/css/+(platform|theme).css') // Выбираем файл для минификации
        .pipe(sourcemaps.init())
        .pipe(cssnano()) // Сжимаем
        .pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dev/css')); // Выгружаем в папку dev/css
});*/

/*
gulp.task('watch', ['browser-sync', 'css-libs', 'scripts'], function() {
    gulp.watch('dev/less/!**!/!*.less', ['less']); // Наблюдение за less файлами в папке less
    gulp.watch('dev/sass/!**!/!*.sass', ['sass']); // Наблюдение за sass файлами в папке sass
    gulp.watch('dev/!*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
    gulp.watch('dev/js/!**!/!*.js', browserSync.reload);   // Наблюдение за JS файлами в папке js
});

gulp.task('clean', function() {
    return del.sync('build'); // Удаляем папку build перед сборкой
});
*/

/*gulp.task('img', function() {
    return gulp.src('dev/images/!**!/!*') // Берем все изображения из dev
        .pipe(cache(imagemin({ // С кешированием
            //.pipe(imagemin({ // Сжимаем изображения без кеширования
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('build/images')); // Выгружаем на продакшен
});*/

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


