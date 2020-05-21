// VARIABLES & PATHS

let filesWatch = 'html,htm,txt,json,md,woff2', // List of files extensions for watching & hard reload (comma separated)
  imagesWatch = 'jpg,jpeg,png,webp,svg', // List of images extensions for watching & compression (comma separated)
  baseDir = 'src', // Base directory path without «/» at the end
  distDir = 'src',
  online = true // If «false» - Browsersync will work offline without internet connection

let paths = {
  scripts: {
    src: [
      // 'node_modules/jquery/dist/jquery.min.js', // npm vendor example (npm i --save-dev jquery)
      baseDir + '/js/app.js', // app.js. Always at the end
    ],
    dest: distDir + '/js',
  },

  styles: {
    src: baseDir + '/scss/main.scss',
    dest: distDir + '/css',
  },

  images: {
    src: baseDir + '/images/src/**/*',
    dest: distDir + '/images/dest',
  },

  cssOutputName: 'app.css',
  jsOutputName: 'bundle.js',
}

// LOGIC

const { src, dest, parallel, series, watch } = require('gulp')
const scss = require('gulp-sass')
const cleanCss = require('gulp-clean-css')
const concat = require('gulp-concat')
const browserSync = require('browser-sync').create()
const autoPrefixer = require('gulp-autoprefixer')
const imageMin = require('gulp-imagemin')
const newer = require('gulp-newer')
const rsync = require('gulp-rsync')
const del = require('del')

function browsersync() {
  browserSync.init({
    server: { baseDir: baseDir + '/' },
    notify: false,
    online: online,
  })
}

function scripts() {
  return src(paths.scripts.src)
    .pipe(concat(paths.jsOutputName))
    .pipe(dest(paths.scripts.dest))
    .pipe(browserSync.stream())
}

function styles() {
  return src(paths.styles.src)
    .pipe(scss())
    .pipe(concat(paths.cssOutputName))
    .pipe(
      autoPrefixer({ overrideBrowserslist: ['last 10 versions'], grid: true })
    )
    .pipe(dest(paths.styles.dest))
    .pipe(browserSync.stream())
}

function images() {
  return src(paths.images.src)
    .pipe(newer(paths.images.dest))
    .pipe(imageMin())
    .pipe(dest(paths.images.dest))
}

function cleanimg() {
  return del('' + paths.images.dest + '/**/*', { force: true })
}

function startwatch() {
  watch(baseDir + '/**/scss/**/*', styles)
  watch(baseDir + '/**/*.{' + imagesWatch + '}', images)
  watch(baseDir + '/**/*.{' + filesWatch + '}').on('change', browserSync.reload)
  watch(
    [baseDir + '/**/*.js', '!' + paths.scripts.dest + '/' + paths.jsOutputName],
    scripts
  )
}

exports.browsersync = browsersync
exports.assets = series(cleanimg, styles, scripts, images)
exports.styles = styles
exports.scripts = scripts
exports.images = images
exports.cleanimg = cleanimg
exports.default = parallel(images, styles, scripts, browsersync, startwatch)
