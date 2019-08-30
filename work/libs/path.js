
const path=require("path")

/**
 * 获取新相对路径
 * @param {*} entryPath 入口路径
 * @param {*} outputPath 出口路径
 * @param {*} refPath 原始参照路径
 * @param {*} relPath 原始参照相对路径
 * @param {*} entryRefFloder 入口参照路径文件夹
 * @param {*} entryRelFloder 入口参照相对路径文件夹
 * @param {*} outRefFloder 出口参照路径文件夹
 * @param {*} outRelfloder 出口参照相对路径文件夹
 */
function  getNewRelativePath(entryPath,outputPath,refPath,relPath,entryRefFloder="",entryRelFloder="",outRefFloder="",outRelfloder="") {
  // 获取原始目标绝对路径
  const oriAbPath=path.dirname(path.join(entryPath,entryRefFloder,refPath))
  // 获取原始相对目标绝对路径
  const oriRelAbPath=path.join(oriAbPath,entryRelFloder,relPath)

  // 原始相对目标 相对路径
  const oriRelPath=path.relative(entryPath,oriRelAbPath)

  // 获取目标绝对目录
  const aminAbPath=path.dirname(path.join(outputPath,outRefFloder,refPath))
  // 获取相对目标绝对目录
  const aminRelAbPath=path.join(outputPath,outRelfloder,oriRelPath)

  return {
    oriRelAbPath:oriRelAbPath,
    aimRelAbPath:aminRelAbPath,
    relPath:path.relative(aminAbPath,aminRelAbPath)
  }
}

module.exports={
  getNewRelativePath
}