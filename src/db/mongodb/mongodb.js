let MongoClient = require('mongodb').MongoClient

// 连接,数据库名,表名
// 每一个操作都创建一个新的连接
class Mongodb{
  // @param {string} url 连接 mongodb://mongodbHost:27017/
  // @param {string} dbName 数据库名
  constructor(url,dbName){
    obj.copyAttr(this,{
      url,dbName
    })
  }
  // @param {string} name 表名
  // @param {fun} callback(表对象) 回调
  tb(name,callback){
    let self = this
    MongoClient.connect(self.url,{useNewUrlParser:true},function(err, db){
      if(err) throw err
      let dbo = db.db(self.dbName)
      let tb = dbo.collection(name)
      callback(tb)
      db.close()
    })
  }
}

module.exports = Mongodb