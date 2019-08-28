const fs=require("fs")
const fsHelperConstruct=require("./libs/fs")
const path=require("path")
const ejs = require('ejs')
const URL = require('ejs')

const prettier = require("prettier");

const getConifg=require("./spack.default")

console.log(getConifg())

const output=path.join(__dirname,"../dist/")


const posthtmlParser = require('posthtml-parser')
const posthtmlRender = require('posthtml-render')



const publicPath=path.join(__dirname,"../public/")
const staticPath=path.join(publicPath,"statics")
const viewPath=path.join(publicPath,"views")
const outputStatic=path.join(output,"statics")
const styleOutputPath=path.join(__dirname,"../","dist","styles")
const scripOutputPath=path.join(__dirname,"../","dist","scripts")

// 提取css和js

// content
// instanceof Object
// attrs 
// tag:"link"
// href:"../statics/styles/index.scss"
// rel:"stylesheet"

// tag:"script"
// src:"../statics/scripts/index.js"




// 查询文件夹
// 存在则复制
// if(!fs.existsSync(output+"views/")){
//   fs.mkdirSync(output+"views/",{recursive:true}) 
// }
// fs.writeFileSync(output+"views/index.html", prettier.format(html, { semi:true, parser: "html" }),'utf8')
const fsHelper=fsHelperConstruct(viewPath)
const htmls=fsHelper.getAllFiles("./")

function getNode(node){
  let nodes=[]
  if(node.content instanceof Array){
    for(let n of node.content){
      nodes=nodes.concat(getNode(n))
    }
  }else if(node instanceof Object){
    
    return [node]
  }
  return nodes
}


// 获取html中的信息
const tasks=htmls.map((htmlPath)=>{
  // 获取模版
  // 拼接
  let people = ['geddy', 'neil', 'alex']
  let html = ejs.render(fs.readFileSync(htmlPath, 'utf8'), {people: people},{filename:htmlPath})
  html=prettier.format(html, { semi:true, parser: "html" })
  // 获取ast
  let htmlAst = posthtmlParser(html)
  const htmlpath=path.join(output,path.relative(viewPath,htmlPath))
  
  const styles=[]
  const scripts=[]
  // 解析ast
  for(let node of htmlAst){
    getNode(node).forEach((n)=>{
      if(n.tag==="script" && n.attrs.src){ 
        scripts.push(n.attrs.src)
        n.attrs.src=path.relative(path.dirname(htmlpath),path.join(outputStatic,path.relative(staticPath,path.join(viewPath,n.attrs.src))))
        
      }else if(n.tag==="link" && n.attrs.rel==="stylesheet"){
        styles.push(n.attrs.href)
        n.attrs.href=path.relative(path.dirname(htmlpath),path.join(outputStatic,path.relative(staticPath,path.join(viewPath,n.attrs.href))))
        
      }
    })
  }
  return {
    htmlPath:path.join(output,path.relative(viewPath,htmlPath)),
    htmlAst,
    html:posthtmlRender(htmlAst),
    scripts,
    styles
  }
})

// 加前缀

const autoprefixer = require('autoprefixer');
const postcss = require('postcss');
const sass = require('node-sass');

// style
// js

const babel = require("@babel/core");
const babelConfig={
  "presets": [
    [
      "@babel/env",
      {
        "useBuiltIns": "entry"
      }
    ]
  ]
}


async function run(){
  const filesResult=[],stylesmap=[],scriptmap=[]
  for(let task of tasks){
    filesResult.push({
      path:task.htmlPath,
      source:task.html
    })
    for(let s of task.styles){
      if(stylesmap.indexOf(s)<0){
        stylesmap.push(s)
        filesResult.push({
          path:path.resolve(styleOutputPath,s),
          source:await cssProcess(path.join(staticPath,s))
        })
      }
    }
    for(let s of task.scripts){
      if(scriptmap.indexOf(s)<0){
        scriptmap.push(s)
        filesResult.push({
          path:path.resolve(scripOutputPath,s),
          source:jsProcess(path.join(staticPath,s))
        })
      }
    }
  }
  console.log(filesResult)
  await writeFiles(filesResult)
}

run()
async function writeFiles(files){
  for(let f of files){
    if(!fs.existsSync(f.path)){
      fs.mkdirSync(path.dirname(f.path),{recursive:true}) 
    }
    fs.writeFileSync(f.path, f.source,'utf8')
  }
}


async function cssProcess(cssPath){
  const result=sass.renderSync({
    file: cssPath,
  });
  const css=await postcss(autoprefixer).process(result.css).then(r => {
    r.warnings().forEach(warn => {
      console.warn(warn.toString())
    })
    return prettier.format(r.css.toString(), { semi:true, parser: "css" })
  })
  return css
}

function jsProcess(jsPath){
  const js=babel.transformFileSync(jsPath, babelConfig)
  return prettier.format(js.code, { semi:true, parser: "babel" })
}


return ;
// scss


// if(!fs.existsSync(output+"statics/styles/")){
//   fs.mkdirSync(output+"statics/styles/",{recursive:true}) 
// }



console.log(tasks)
return;
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