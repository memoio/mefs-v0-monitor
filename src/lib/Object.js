class Object{
  /**
   * 把obj2的所有属性、方法复制到obj1中
   * @param {object} obj1 
   * @param {object} obj2 
   */
  copyAttr(obj1,obj2){
    for(let k in obj2){
      obj1[k] = obj2[k]
    }
  }
}

module.exports = Object