const fs=require("fs")
const path=require("path")
const ejs = require('ejs')
const getConifg=require("./spack.config")

console.log(getConifg())
const htmlTemplatePath=path.join(__dirname,"../public/")
const output=path.join(__dirname,"../dist/")

let people = ['geddy', 'neil', 'alex']



// 获取模版
// 拼接
let html = ejs.render(
fs.readFileSync(htmlTemplatePath+"index.html", 'utf8'), 
{people: people},
{
  filename:htmlTemplatePath+"index.html"
}
)

// 查询文件夹
// 存在则复制
if(!fs.existsSync(output)){
  fs.mkdirSync(output) 
}
fs.writeFileSync(output+"index.html", html,'utf8')

