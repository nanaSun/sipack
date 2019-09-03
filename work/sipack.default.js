const path=require("path")
const fs=require("fs")

module.exports= (c)=>{
    const context=c?c:process.cwd();
    const configFile=path.join(context,".sipack.json")
    let api={}
    if(fs.existsSync(configFile)){
        api=JSON.parse(fs.readFileSync(configFile,"utf8"))
    }
    return {
        context,
        output:path.join(context,api.output?api.output:"output"),
        entry:path.join(context,api.entry?api.entry:"entry"),
        isImageMin:api.imgmin?api.imgmin:false,
    }
}