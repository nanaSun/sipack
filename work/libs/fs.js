const fs=require("fs")
const path=require("path")

// 遍历文件夹
module.exports = function fsHelper(context) {
  var rootPath=context
  /**
   * 
   * @param {*} folder 相对于context的相对路径
   */
  function getAllFiles(folder){
    
    const Files=[]
    function checkFolder(folder){
      if(/^_/.test(path.basename(folder))) { return; }
      const folderPath=path.join(rootPath,folder);
      let st = fs.statSync(folderPath);
      if (st.isFile()){
        Files.push(folderPath)
      }else if (st.isDirectory()) {
        // 作为文件夹
        fs.readdirSync(folderPath).forEach(function (filename) {
          checkFolder(path.join(folder,filename))
        });
      }
    }
    checkFolder(folder)
    return Files;
  }
  return {
    getAllFiles
  }
};
