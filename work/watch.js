const fs=require("fs")
// require the module as normal
var browserSync = require("browser-sync");


module.exports=async function(entry,run){
  // Start the server
  let startSever=false;
  browserSync({server: "./dist"});
  // 开启watch任务
  // CSS监控任务
  let isRunning=false;
  // 监控CSS
  fs.watch(entry, {
    recursive: true
  }, async (eventType, filename) => {
    if(isRunning) return;
    
    isRunning=true
    console.log("file: "+filename+" has "+eventType);
    if(startSever){
      await run()
      browserSync.reload(filename);
    }
    console.log("reloading:"+filename);
    startSever=true
    isRunning=false
  });

  
}
