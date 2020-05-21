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
    dest: distDir + '/dist',
  },

  styles: {
    src: baseDir + '/scss/main.scss',
    dest: distDir + '/dist',
  },

  images: {
    src: baseDir + '/images/src/**/*',
    dest: distDir + '/images/dest',
  },
}

// LOGIC

const { src, dest, parallel, series, watch } = require('gulp')
const scss = require('gulp-sass')
const cleanCss = require('gulp-clean-css')
const concat = require('gulp-concat')
const replace = require('gulp-replace')
const browserSync = require('browser-sync').create()
const autoPrefixer = require('gulp-autoprefixer')
const imageMin = require('gulp-imagemin')
const newer = require('gulp-newer')
const rsync = require('gulp-rsync')
const del = require('del')
const fs = require('fs')
const inject = require('gulp-inject')
const debug = require('gulp-debug')

function touch(file) {
  const time = new Date()

  try {
    fs.utimesSync(file, time, time)
  } catch (err) {
    fs.closeSync(fs.openSync(file, 'w'))
  }
}

function browsersync() {
  browserSync.init({
    server: { baseDir: baseDir + '/' },
    notify: false,
    online: online,
  })
}

function makeBundle() {
  const timestamp = new Date().getTime()

  return src(paths.scripts.src)
    .pipe(concat('bundle' + timestamp + '.js'))
    .pipe(dest(paths.scripts.dest))
    .pipe(browserSync.stream())
}

function makeStyle() {
  const timestamp = new Date().getTime()

  return src(paths.styles.src)
    .pipe(scss())
    .pipe(concat('style' + timestamp + '.css'))
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

function cleanStyle() {
  return del(distDir + '/dist/style*', { force: true })
}

function cleanBundle() {
  return del(distDir + '/dist/bundle*', { force: true })
}

function index() {
  // workaround for inject!! - touch file
  touch(baseDir + '/index.html')
  const target = src(baseDir + '/index.html')
  // It's not necessary to read the files (will speed up things), we're only after their paths:
  const sources = src(distDir + '/dist/*', { read: false }).pipe(debug())

  return target.pipe(inject(sources, { relative: true })).pipe(dest(distDir))
}

function startwatch() {
  watch(baseDir + '/**/scss/**/*', styles)
  watch(baseDir + '/**/js/**/*.js', scripts)
  watch(baseDir + '/**/*.{' + imagesWatch + '}', images)
  watch(baseDir + '/**/*.{' + filesWatch + '}').on('change', browserSync.reload)
}

const scripts = series(cleanBundle, makeBundle, index)
const styles = series(cleanStyle, makeStyle, index)
const assets = series(styles, scripts, cleanimg, images)

exports.browsersync = browsersync
exports.assets = assets
exports.styles = styles
exports.scripts = scripts
exports.images = images
exports.cleanimg = cleanimg
exports.default = series(assets, parallel(browsersync, startwatch))
