const { database } = require("../config/mongodb");

class Item {
  static itemCollection() {
    return database.collection("items");
  }
  static async getAllItems(storeId) {
    const res = await this.itemCollection().find({ storeId }).toArray();
    // const res = await this.itemCollection().find().toArray();
    return res;
  }

  static async getItemById(storeId, productId) {
    const res = await this.itemCollection().findOne({
      _id: productId,
      storeId,
    });
    return res;
  }

  static async createItem(item) {
    // console.log("🚀 ~ Item ~ createItem ~ item:", item);
    return await this.itemCollection().insertOne(item);
  }
}

module.exports = Item;
