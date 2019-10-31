let fs = require('fs')

let eth = app.eth

let db = {
  block:{
    length:0,
  },
  blockMap:{},
  info:{
    blockNumber: 0,
    difficulty: '',
    gasLimit: [],
    gasPrice: [],
    txpool: {},
  },
  tx:{},
  txMap:{},
  address:{
    external:{},
    contract:{},
  },
  txReceiptDb:{},
}
function write(file,data){
  fs.writeFileSync(file,JSON.stringify(data))
}

let listening = {
  async init(){
    let start = 0
    let num = await eth.blockNumber()
    db.info.blockNumber = num
    for(let id=start; id<=num; id++){
      let block = await eth.getBlock(id)
      // 添加块信息
      db.block[id]=block
      db.blockMap[block.hash]=id
      db.block.length += 1
      db.info.difficulty = block.difficulty
      db.info.gasLimit.push(block.gasLimit)
      for(let tx of block.transactions){
        // 添加交易信息
        // 添加时间戳
        tx.timestamp = block.timestamp
        db.tx[tx.hash] = tx
        // 添加交易映射
        if(!db.txMap[id]){
          db.txMap[id] = []
        }
        db.txMap[id].push(tx.hash)
        // TODO 判断地址的类型
        // 添加地址
        let data = await app.eth.getBalance(tx.from)
        db.address.external[tx.from] = data
        if(tx.to){
          data = await app.eth.getBalance(tx.to)
          db.address.external[tx.to] = data
        }
        // 添加其它信息
        db.info.gasPrice.push(tx.gasPrice)
        // 添加交易详情
        data = await eth.getTransactionReceipt(tx.hash)
        db.txReceiptDb[tx.hash] = data
      }
    }
    let dbHome = 'E:/我的文档/刚收集/工作/长链科技/工作/项目/memoriae/整合/客户端/db/'
    write(dbHome+'block.json',db.block)
    write(dbHome+'block-map.json',db.blockMap)
    write(dbHome+'tx.json',db.tx)
    write(dbHome+'address.json',db.address)
    write(dbHome+'info.json',db.info)
    write(dbHome+'tx-map.json',db.txMap)
    write(dbHome+'tx-receipt.json',db.txReceiptDb)
  },
}
listening.init()