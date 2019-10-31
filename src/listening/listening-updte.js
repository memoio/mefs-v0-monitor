let eth = app.eth

let listening = {
  async update(start){
    // 没有指定从哪开始,则从文件中获取
    if(start != 0 && !start){
      start = app.db.info.get('blockNumber')+1
    }
    let num = await eth.blockNumber()
    app.db.info.set('blockNumber',num)
    for(let id=start; id<=num; id++){
      let block = await eth.getBlock(id)
      // 添加块信息
      app.db.block.set(id,block)
      app.db.blockMap.set(block.hash,id)
      app.db.block.count('length',1)
      app.db.info.set('difficulty',block.difficulty)
      app.db.info.push('gasLimit',block.gasLimit)
      for(let tx of block.transactions){
        // 添加交易信息
        // 添加时间戳
        tx.timestamp = block.timestamp
        app.db.tx.set(tx.hash,tx)
        // 添加交易映射
        app.db.txMap.set(`${id}.${parseInt(tx.transactionIndex,16)}`,tx.hash)
        // TODO 判断地址的类型
        // 添加地址
        let data = await app.eth.getBalance(tx.from)
        app.db.address.set(`external.${tx.from}`,data)
        if(tx.to){
          data = await app.eth.getBalance(tx.to)
          app.db.address.set(`external.${tx.to}`,data)
        }
        // 添加其它信息
        app.db.info.push('gasPrice',tx.gasPrice)
        // 添加交易详情
        data = await eth.getTransactionReceipt(tx.hash)
        app.db.txReceiptDb.set(tx.hash,data)
      }
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