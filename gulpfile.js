// 1. модуль для запуска отдельных тасков gulp-cli (установить глобально npm i gulp-cli -g) - команда gulp
// список глобально установленных модулей npm ls -g --depth=0
// 2. установить gulp в проект npm i gulp@next
// 3. создать package.json - npm init -y

//************************************************
// Подключение gulp и доп модулей ****************
//************************************************
var gulp = require('gulp'),
     concat = require('gulp-concat'),
  
     del = require('del'),  // удаляет из build'a не актуальные файлы
     browserSync = require('browser-sync').create(),
 


//************************************************
// 4. объявляем функции сборки:

//************************************************
// JAVAScript ************************************
//************************************************
const jsFiles = [
      './src/*.js'
     ]
function scripts() {
     return gulp.src(jsFiles)
               .pipe(concat('index.js'))
               //.pipe(uglify({
               //     toplevel: true
               //})) //минификация js
               .pipe(gulp.dest('./build'))
               .pipe(browserSync.stream());
}




//************************************************
// LISTENER **************************************
//************************************************
function watch(){
     browserSync.init({
          // инициализация browserSync запускает сервер на localhost
          // для refresh'a сообщаем об изменениях в соответствующих тасках
          // через вызов browserSync.stream()
          // watch: true,
          // files: ['*.html', 'src/css/*.css', 'src/js/*.js'],
          server: {
               baseDir: './build/'
          },
          // tunnel: true,  // должен создать адрес для удаленного просмотра
          // tunnel: "projectname",  // Demanstration page http://projectname.localtunnel.me
     })
     //отслеживание изменений файлов и запуск функции
     gulp.watch('./src/css/**/*.css', styles);
     gulp.watch('./src/sass/**/*.sass', sassFunc);
     // gulp.watch(['./src/sass/**/*.sass'], ['./src/sass/**/*.scss'], sassFunc);
     gulp.watch('./src/js/**/*.js', scripts);
     gulp.watch('./src/*.html', html);
     // gulp.watch('./*.html').on('change', browserSync.reload);
}

function clean(){
     return del(['build/*']);
     //ставим return - поскольку gulp 4 требует завершения тасков
}

// 5. регистрация задач - тасков, для запуска из консоли
// gulp.task('html', html);
// gulp.task('sass', sassFunc);
// gulp.task('otherfiles', otherfiles);
// gulp.task('styles', styles);
// gulp.task('scripts', scripts);
gulp.task('watch', watch);
gulp.task('default', watch);

gulp.task('build', gulp.series(clean, html, sassFunc, otherfiles,
                         gulp.parallel(styles, scripts)
                    )); //последовательное и параллельное выполнение кода
                         //параллельное выполнение не гарантирует последовательности

gulp.task('dev', gulp.series('build', 'watch'));
