let log = console.log,
dir = console.dir

let Object = require('./src/lib/Object')
let obj = new Object()

obj.copyAttr(global,{log,dir,obj})

// let dbHome = '../db/'
let config = require('./src/config/config')
let eth = require('./src/eth/eth')
// let Lowdb = require('./src/db/Lowdb')
// let blockDb = new Lowdb(dbHome+'block.json')
// let blockMapDb = new Lowdb(dbHome+'block-map.json')
// let txDb = new Lowdb(dbHome+'tx.json')
// let addressDb = new Lowdb(dbHome+'address.json')
// let infoDb = new Lowdb(dbHome+'info.json')
// let txMapDb = new Lowdb(dbHome+'tx-map.json')
// let txReceiptDb = new Lowdb(dbHome+'tx-receipt.json')
let axios = require('axios')
let Web3 = require('web3')
let web3 = new Web3(Web3.givenProvider || config.ethUrl)
config.order.tag.order = web3.utils.sha3(config.order.tag.order)
config.order.tag.readPay = web3.utils.sha3(config.order.tag.readPay)
config.order.tag.payKeeper = web3.utils.sha3(config.order.tag.payKeeper)
config.order.tag.payProvider = web3.utils.sha3(config.order.tag.payProvider)

let Mongodb = require('./src/db/mongodb/mongodb')
let Table = require('./src/db/mongodb/table')
let db = new Mongodb(config.mongodbUrl,config.dbName)
let block = new Table(db,'block')
let tx = new Table(db,'tx')
let order = new Table(db,'order')
let payOrder = new Table(db,'payOrder')
let dict = new Table(db,'dict')

global.app = {
  config,
  // db:{
  //   block:blockDb,
  //   blockMap:blockMapDb,
  //   tx:txDb,
  //   address:addressDb,
  //   info:infoDb,
  //   txMap:txMapDb,
  //   txReceiptDb:txReceiptDb,
  // },
  mdb:{
    block,tx,order,dict,payOrder,
  },
  eth,web3,axios,
}

let Jt = require('./src/listening/listening-mongodb')
let jt = new Jt()

async function start(){
  let bn = await dict.select({key:'blockNumber'})
  // await dict.updateOne({key:'blockNumber'},{value:3})
  // 如果没有则初始化为-1
  if(bn.length == 0){
    await dict.insertOne({key:'blockNumber',value:-1})
  }else{
    // 有则判断是否更新到了指定块,没有则判断丢失了哪些块,添加上
    jt.checkBlockList(0,bn[0].value)
  }
  jt.watch()
}
start()