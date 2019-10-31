let eth = app.eth
async function t1(){
  // let bn = await eth.blockNumber()
  // console.log(bn)
  // let block = await eth.getBlock(1)
  // console.log(block)
  let tx = await eth.getTransaction('0x043c557f83b1b8849b23ebb8fb4f1b500487adbf649821c346f41b6bf71564f7')
  console.log(tx)
}
// t1()

let listening = {
  async update(start){
    // 没有指定从哪开始,则从文件中获取
    if(start != 0 && !start){
      start = app.db.info.get('blockNumber')+1
    }
    let num = await eth.blockNumber()
    app.db.info.set('blockNumber',num)
    for(let id=start; id<=num; id++){
      eth.getBlock(id).then(block=>{
        // 添加块信息
        app.db.block.set(id,block)
        app.db.block.count('length',1)
        app.db.info.set('gasLimit.'+id,block.gasLimit)
        for(let tx of block.transactions){
          // 添加交易信息
          app.db.tx.set(tx.hash,tx)
          // 添加交易映射
          app.db.txMap.set(`${id}.${parseInt(tx.transactionIndex,16)}`,tx.hash)
          // TODO 判断地址的类型
          // 添加地址
          app.eth.getBalance(tx.from).then(data=>{
            app.db.address.set(`external.${tx.from}`,data)
          })
          app.eth.getBalance(tx.to).then(data=>{
            app.db.address.set(`external.${tx.to}`,data)
          })
          // 添加其它信息
          app.db.info.push('gasPrice',tx.gasPrice)
          // 添加交易详情
          eth.getTransactionReceipt(tx.hash).then(res => {
            app.db.txReceiptDb.set(tx.hash,res)
          })
        }
      })
    }
  },
  async init(){
    this.update(0)
  },
  async listening(){
    setInterval(this.update,3000)
  }
}
listening.init()
// listening.listening()