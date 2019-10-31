let eth = app.eth,
db = app.mdb

class Listening{
  // 监听
  async watch(time=3000){
    let self = this
    async function cl(){
      let start = await db.dict.select({key:'blockNumber'})
      start = start[0].value
      start++
      let end = await eth.blockNumber()
      // 只加载当前块减20之前的块,避免块取消
      end -= 20
      if(end <= start){
        return
      }
      // 更新
      db.dict.updateOne({key:'blockNumber'},{value:end})
      self.handleBlockList(start,end)
    }

    setInterval(cl,time)
  }
  // 添加指定区间中没有的块
  async checkBlockList(start,end){
    let block
    for(let i=start; i<=end; i++){
      block = await db.block.select({id:i},{projection:{'_id':0,'id':1}})
      if(block.length == 0){
        await this.handleBlock(i)
      }
    }
  }
  // 处理指定区间的块 [start,end]
  async handleBlockList(start,end){
    for(let i=start; i<=end; i++){
      await this.handleBlock(i)
    }
  }
  // 处理指定块
  async handleBlock(i){
    let block = await eth.getBlock(i)
    // 存储块信息
    block.id = i
    db.block.insertOne(block)
    // 存储交易信息
    for(let tx of block.transactions){
      // 添加块ID 时间戳
      tx.id = i
      tx.timestamp = block.timestamp
      // 添加 receipt中的信息
      let data = await eth.getTransactionReceipt(tx.hash)
      obj.copyAttr(tx,{
        contractAddress:data.contractAddress,
        cumulativeGasUsed:data.cumulativeGasUsed,
        gasUsed:data.gasUsed,
        logs:data.logs,
        logsBloom:data.logsBloom,
        root:data.root,
      })
      db.tx.insertOne(tx)
      let timestamp = parseInt(tx.timestamp,16)
      for(let log of tx.logs){
        switch(log.topics[0]){
          // 添加订单信息
          case app.config.order.tag.order:
            let uk = app.web3.eth.Contract(app.config.order.abi,log.address)
            let res = await uk.methods.getOrder().call()
            db.order.insertOne({
              tx:tx.hash,
              address:log.address,
              timestamp:timestamp,
              user:res[0],
              keeper:res[1],
              provider:res[2],
              time:res[3].toString(),
              size:res[4].toString(),
              totalPay:res[5].toString(),
            })
          break
          // 添加支付信息
          case app.config.order.tag.readPay:
            db.payOrder.insertOne({
              tx:tx.hash,
              address:log.address,
              timestamp:timestamp,
              type:'ReadPay',
              role:'provider',
              from:'0x'+log.topics[1].slice(26),
              to:'0x'+log.topics[2].slice(26),
              value:getValue(log.topics[3]),
            })
          break
          case app.config.order.tag.payKeeper:
            db.payOrder.insertOne({
              tx:tx.hash,
              address:log.address,
              timestamp:timestamp,
              type:'spaceTimePay',
              role:'keeper',
              from:'0x'+log.topics[1].slice(26),
              to:'0x'+log.topics[2].slice(26),
              value:getValue(log.topics[3]),
            })
          break
          case app.config.order.tag.payProvider:
            db.payOrder.insertOne({
              tx:tx.hash,
              address:log.address,
              timestamp:timestamp,
              type:'spaceTimePay',
              role:'provider',
              from:'0x'+log.topics[1].slice(26),
              to:'0x'+log.topics[2].slice(26),
              value:getValue(log.topics[3]),
            })
          break
        }
      }
    }
  }
}
function getValue(val){
  val = val.slice(2)
  let i = 0
  for(;i<val.length;i++){
    if(val.charAt(i) != '0'){
      break
    }
  }
  val = val.substring(i,val.length)
  val = val==''?'0':val
  val = '0x' + val
  return val
}

module.exports = Listening