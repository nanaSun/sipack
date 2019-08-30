// 系统方法
const fs=require("fs")
const path=require("path")


// html编译
const ejs = require('ejs')
const posthtmlParser = require('posthtml-parser')
const posthtmlRender = require('posthtml-render')

//
// css后期处理，加前缀
const autoprefixer = require('autoprefixer');
const postcss = require('postcss');

// sass编译器
const sass = require('node-sass');

// less编译器
const less = require("less")

//babel
const babel = require("@babel/core");

// babel defaultConfig

// 图片压缩
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');

// 格式化代码
const prettier = require("prettier");

// 遍历文件夹
const fsHelperConstruct=require("./libs/fs")

const {getNewRelativePath}=require("./libs/path")

// 获取配置
const initConfig=require("./spack.default")


const {context,output,entry,isImageMin}=initConfig()



// 开发环境的主要mapview
const viewEntryPath=path.join(entry,"views")

// 发布环境的静态资源
const outputStatic=path.join(output,"statics")



const fsHelper=fsHelperConstruct(viewEntryPath)
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

function getOutputPath(p){
  return path.join(viewEntryPath,p)
}

// 获取html中的信息
const tasks=htmls.map((htmlPath)=>{
 
  // 获取模版
  // 拼接
  let people = ['geddy', 'neil', 'alex']
  let html = ejs.render(fs.readFileSync(getOutputPath(htmlPath), 'utf8'), {people: people},{filename:getOutputPath(htmlPath)})
  html=prettier.format(html, { semi:true, parser: "html" })
  // 获取ast
  let htmlAst = posthtmlParser(html)
  
  const styles=[]
  const scripts=[]
  const images=[]
  // 解析ast
  for(let node of htmlAst){
    getNode(node).forEach((n)=>{
      if(n.tag==="script" && n.attrs.src){ 
        const newAddr=getNewRelativePath(entry,output,htmlPath,n.attrs.src,"view","","view")
        scripts.push(newAddr)
        n.attrs.src=newAddr.relPath
        
      }else if(n.tag==="link" && n.attrs.rel==="stylesheet"){
        const newAddr=getNewRelativePath(entry,output,htmlPath,n.attrs.href,"view","","view")
        styles.push(newAddr)
        n.attrs.href=newAddr.relPath
      }else if(n.tag==="img" && n.attrs.src){
        const newAddr=getNewRelativePath(entry,output,htmlPath,n.attrs.src,"view","","view")
        images.push(newAddr)
        n.attrs.src=newAddr.relPath
      }
    })
  }
  return {
    htmlPath:path.join(output,"view",htmlPath),
    htmlAst,
    html:posthtmlRender(htmlAst),
    scripts,
    styles,
    images
  }
})


/**
 * 
 * @param {*} p 待编译的css路径
 */
function cssPathProcess(p){
  const oriPath=path.parse(p);
  oriPath.ext=".css";
  oriPath.base=oriPath.base.replace(/\.(sc|le)ss/i,".css");
  return path.format(oriPath)
}


async function run(){
  const filesResult=[],stylesmap=[],scriptmap=[],imagesmap=[]
  for(let task of tasks){
    filesResult.push({
      path:task.htmlPath,
      source:task.html
    })
    for(let s of task.styles){
      if(stylesmap.indexOf(s)<0){
        stylesmap.push(s.relPath)
        filesResult.push({
          path:cssPathProcess(s.aimRelAbPath),
          source:await cssProcess(s.oriRelAbPath)
        })
      }
    }
    for(let s of task.scripts){
      if(scriptmap.indexOf(s)<0){
        scriptmap.push(s.aim)
        filesResult.push({
          path:s.aimRelAbPath,
          source:jsProcess(s.oriRelAbPath)
        })
      }
    }
    for(let s of task.images){
      if(imagesmap.indexOf(s)<0){
        imagesmap.push(s)
      }
    }
  }
  await writeFiles(filesResult)
  await writeAssets(imagesmap)
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
async function writeAssets(images){
  if(isImageMin){
    await imagemin(images.map((i)=>i.oriRelAbPath), {
      destination: path.join(outputStatic,"images"),
      plugins: [
        imageminJpegtran(),
        imageminPngquant({
          quality: [0.6, 0.8]
        })
      ]
    })
  }else{
    images.forEach((img)=>{
      if(!fs.existsSync(img.aimRelAbPath)){
        fs.mkdirSync(path.dirname(img.aimRelAbPath),{recursive:true}) 
      }
      fs.writeFileSync(img.aimRelAbPath, fs.readFileSync(img.oriRelAbPath));
    })
  }
  return;
}
async function cssProcess(cssPath){
  let css=""
  const resource=fs.readFileSync(cssPath, 'utf8')
  const pathObj=path.parse(cssPath)
  if(pathObj.ext===".scss"){
    const result=sass.renderSync({
      data: resource,
    });
    css=result.css
  }else if(pathObj.ext===".less"){
    const result =await less.render(resource, {})
    css=result.css
  }
  //加前缀
  return await postcss(autoprefixer).process(css).then(r => {
    r.warnings().forEach(warn => {
      console.warn(warn.toString())
    })
    return prettier.format(r.css.toString(), { semi:true, parser: "css" })
  })
}

function jsProcess(jsPath){
  const js=babel.transformFileSync(jsPath)
  return prettier.format(js.code, { semi:true, parser: "babel" })
  return ""
}


return ;
