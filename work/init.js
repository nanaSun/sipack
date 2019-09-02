const context=process.cwd();
const path=require("path")
const fs=require("fs")

module.exports=function(folder){
  console.log(folder,context,path.join(__dirname,"../template"))
  copyFolder(path.join(__dirname,"../template"),path.join(context,folder),()=>{
    console.log("copy 成功")
  })
}

function copyFolder(srcDir, tarDir, cb) {
  if(!fs.existsSync(tarDir)){
    fs.mkdirSync(tarDir)
  }
  fs.readdir(srcDir, function(err, files) {
    var count = 0
    var checkEnd = function() {
      ++count == files.length && cb && cb()
    }

    if (err) {
      checkEnd()
      return
    }

    files.forEach(function(file) {
      var srcPath = path.join(srcDir, file)
      var tarPath = path.join(tarDir, file)

      fs.stat(srcPath, function(err, stats) {
        if (stats.isDirectory()) {
          console.log('mkdir', tarPath)
          fs.mkdir(tarPath,{recursive:true}, function(err) {
            if (err) {
              console.log(err)
              return
            }

            copyFolder(srcPath, tarPath, checkEnd)
          })
        } else {
          copyFile(srcPath, tarPath, checkEnd)
        }
      })
    })

    //为空时直接回调
    files.length === 0 && cb && cb()
  })
}

function copyFile(srcPath, tarPath, cb) {
  var rs = fs.createReadStream(srcPath)
  rs.on('error', function(err) {
    if (err) {
      console.log('read error', srcPath)
    }
    cb && cb(err)
  })

  var ws = fs.createWriteStream(tarPath)
  ws.on('error', function(err) {
    if (err) {
      console.log('write error', tarPath)
    }
    cb && cb(err)
  })
  ws.on('close', function(ex) {
    cb && cb(ex)
  })
  rs.pipe(ws)
}