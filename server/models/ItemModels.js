const { database } = require("../config/mongodb");

class Item {
  static itemCollection() {
    return database.collection("items");
  }
  static async getAllItems() {
    const res = await this.itemCollection().find().toArray();
    return res;
  }

  static async createItem(item) {
    // console.log("🚀 ~ Item ~ createItem ~ item:", item);
    return await this.itemCollection().insertOne(item);
  }
}

module.exports = Item;
