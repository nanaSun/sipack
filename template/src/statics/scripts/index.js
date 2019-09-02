const a=1

setTimeout(()=>{
  console.log(this)
},1000)

const b=`${a}1111`