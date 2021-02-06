import gulp from 'gulp';
import gpug from 'gulp-pug';
import ws from 'gulp-webserver';
import del from 'del';
import image from 'gulp-image';
import sass from 'gulp-sass'
import autoprefixer from 'gulp-autoprefixer';
import miniCSS from 'gulp-csso';
import bro from 'gulp-bro';
import babelify from 'babelify';
import ghPages from 'gulp-gh-pages';


sass.compiler = require('node-sass')

const routes = {
	pug: {
		watch: "./src/**/*.pug",
		src: "./src/*.pug",
		dest: "build"
	},
	img: {
		src: './src/img/*.svg',
		dest: 'build/img'
	},
	scss: {
		watch: "./src/**/*.scss",
		src: './src/scss/styles.scss',
		dest: 'build/css'
	},
	js: {
		watch: './src/**/*.js',
		src: './src/js/main.js',
		dest: 'build/js'
	}
}

const clean = () => del(["build"]);
// 필요업는걸 지우고 리빌드

const img = () => gulp.src(routes.img.src).pipe(image()).pipe(gulp.dest(routes.img.dest))

const styles = () => gulp
	.src(routes.scss.src)
	.pipe(sass().on('error', sass.logError))
	.pipe(autoprefixer({
		Browserslist: ['last 2 versions']
	}))
	.pipe(miniCSS())
	.pipe(gulp.dest(routes.scss.dest));

const pug = () => gulp.src(routes.pug.src).pipe(gpug()).pipe(gulp.dest(routes.pug.dest));
// 함수안에 src 폴더를 빌드해준다

const js = () => gulp
	.src(routes.js.src)
	.pipe(
		bro({
			transform: [
				babelify.configure({presets: ["@babel/preset-env"]}),
				["uglifyify", {global: true}]
			]
		})
	)
	.pipe(gulp.dest(routes.js.dest));

const prepare = gulp.series([clean, img]);

const assets = gulp.series([pug, styles, js]); // watch 할꺼만

const webserver = () => gulp.src('build').pipe(ws({livereload: true, open: false}));
const watch = () => {
	gulp.watch(routes.pug.watch, pug)
	gulp.watch(routes.scss.watch, styles)
	gulp.watch(routes.js.watch, js)
}
const ghDeploy = () => gulp.src('build/**/*').pipe(ghPages())


const postDev = gulp.series([webserver, watch]);

export const build = gulp.series([prepare, assets]);
// export 를 해야 사용가능
export const dev = gulp.series([prepare, assets, postDev]);

export const deploy = gulp.series([build, ghDeploy]);

/// pipe => 물을 파이프에 넣으면 병함 시키는거임

