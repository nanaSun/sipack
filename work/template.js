const fs=require("fs")
const path=require("path")
const ejs = require('ejs')

const prettier = require("prettier");

const getConifg=require("./spack.config")

console.log(getConifg())

const output=path.join(__dirname,"../dist/")


const posthtml = require('posthtml')


// 获取模版
// 拼接

const htmlTemplatePath=path.join(__dirname,"../public/views/")
let people = ['geddy', 'neil', 'alex']
let html = ejs.render(
fs.readFileSync(htmlTemplatePath+"index.html", 'utf8'), 
{people: people},
{
  filename:htmlTemplatePath+"index.html"
}
)

let a=posthtml().process(html,{ sync: true })

// 提取css和js

// content
// instanceof Object
// attrs 
// tag:"link"
// href:"../statics/styles/index.scss"
// rel:"stylesheet"

// tag:"script"
// src:"../statics/scripts/index.js"

const node=a.tree[2]

console.log(node)

// 查询文件夹
// 存在则复制
if(!fs.existsSync(output+"views/")){
  fs.mkdirSync(output+"views/",{recursive:true}) 
}
fs.writeFileSync(output+"views/index.html", prettier.format(html, { semi:true, parser: "html" }),'utf8')

// 加前缀

const autoprefixer = require('autoprefixer')
const postcss = require('postcss')

// style

const staticsTemplatePath=path.join(__dirname,"../public/statics/")

const styleTemplatePath=path.join(staticsTemplatePath,"styles")

// scss
const sass = require('node-sass');

var result = sass.renderSync({
  file: styleTemplatePath+"/index.scss",
});

if(!fs.existsSync(output+"statics/styles/")){
  fs.mkdirSync(output+"statics/styles/",{recursive:true}) 
}



postcss(autoprefixer).process(result.css).then(r => {
  r.warnings().forEach(warn => {
    console.warn(warn.toString())
  })
  fs.writeFileSync(output+"statics/styles/index.css", prettier.format(r.css.toString(), { semi:true, parser: "css" }),'utf8')
  console.log(r.css)
})


// less
var less = require("less")

less.render(fs.readFileSync(styleTemplatePath+"/index.less", 'utf8'), {})
.then(function(data) {
  postcss(autoprefixer).process(data.css).then(r => {
    r.warnings().forEach(warn => {
      console.warn(warn.toString())
    })
    fs.writeFileSync(output+"statics/styles/index.less.css", prettier.format(r.css, { semi:true, parser: "css" }),'utf8')
    console.log(r.css)
  })
  
},
function(error) {
  console.log(error)
});



// 编译js

var babel = require("@babel/core");



const scriptTemplatePath=path.join(staticsTemplatePath,"scripts")

var js = babel.transformFileSync(scriptTemplatePath+"/index.js", {
  "presets": [
    [
      "@babel/env",
      {
        "useBuiltIns": "entry"
      }
    ]
  ]
})

if(!fs.existsSync(output+"statics/scripts/")){
  fs.mkdirSync(output+"statics/scripts/",{recursive:true}) 
}

fs.writeFileSync(output+"statics/scripts/index.js", prettier.format(js.code, { semi:true, parser: "babel" }),'utf8')


// 图片压缩

const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');

const assetsTemplatePath=path.join(__dirname,"../public/statics/");

(async () => {
	const files = await imagemin([assetsTemplatePath+'images/*.{jpg,png}'], {
		destination: output+"statics/images",
		plugins: [
			imageminJpegtran(),
			imageminPngquant({
				quality: [0.6, 0.8]
			})
		]
	});
	console.log(files);
})();


// require('imagemin-gifsicle')({
//   interlaced: false
// }),
// require('imagemin-mozjpeg')({
//   progressive: true,
//   arithmetic: false
// }),
// require('imagemin-pngquant')({
//   floyd: 0.5,
//   speed: 2
// }),
// require('imagemin-svgo')({
//   plugins: [
//       { removeTitle: true },
//       { convertPathData: false }
//   ]
// })