/**
 * 调用指定方法
 * @param {string} method 方法名
 * @param {array} params 参数
 * @return {object}
 */
async function get(method,...params){
  // console.log(method,params)
  return new Promise((resolve, reject)=>{
    app.axios({
      method: 'post',
      url: app.config.ethUrl,
      data: {
        jsonrpc:'2.0',
        id:1,
        method:method,
        params:params
      }
    }).then(res=>{
      if(res.data.error){
        console.log(res.data)
      }
      resolve(res.data.result)
    }).catch(err=>{
      reject(err)
    })
  })
}

let eth = {
  async blockNumber(){
    let num = await get('eth_blockNumber')
    return parseInt(num.slice(2),16)
  },
  async getBlock(id){
    return get('eth_getBlockByNumber','0x'+id.toString(16),true)
    // return get('eth_getBlockByHash',id)
  },
  async getTransaction(hash){
    return get('eth_getTransactionByHash',hash)
  },
  async getTransactionReceipt(hash){
    return get('eth_getTransactionReceipt',hash)
  },
  async pendingTransactions(){
    return get('eth_pendingTransactions')
  },
  async txpoolContent(){
    return get('txpool_content')
  },
  async getCode(){
    return get('eth_getCode','pending')
  },
  async getBalance(addr){
    return get('eth_getBalance',addr,'pending')
  }
  
}

module.exports = eth