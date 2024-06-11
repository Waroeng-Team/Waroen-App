const { database } = require("../config/mongodb");

class Item {
  static itemCollection() {
    return database.collection("items");
  }
  static async getAllItems() {
    const res = await this.itemCollection().find().toArray();
    return res;
  }
}

module.exports = Item;
