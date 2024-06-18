const { database } = require("../config/mongodb");

class Item {
  static itemCollection() {
    return database.collection("items");
  }
  static async getAllItems(storeId, dataSearch) {
    const agg = [
      {
        $match: {
          storeId: storeId,
        },
      },
      {
        $match: {
          name: {
            $regex: dataSearch,
            $options: "i",
          },
        },
      },
    ];

    const cursor = this.itemCollection().aggregate(agg);
    const result = await cursor.toArray();
    // const res = await this.itemCollection().find({ storeId }).toArray();
    // const res = await this.itemCollection().find().toArray();
    return result;
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
    let createItem = await this.itemCollection().insertOne(item);
    await this.itemCollection().updateOne(
      { _id: createItem.insertedId },
      { $set: { barcode: createItem.insertedId } }
    );
    let result = await this.itemCollection().findOne({
      _id: createItem.insertedId,
    });
    return result;
  }

  static async updateItem(item) {
    // console.log("🚀 ~ Item ~ updateItem ~ item:", item);
    // console.log("🚀 ~ Item ~ updateItem ~ item:", item);
    const res = await this.itemCollection().updateOne(
      { _id: item._id },
      { $set: item }
    );
    // console.log("🚀 ~ Item ~ updateItem ~ res:", res);
    console.log("🚀 ~ Item ~ updateItem ~ item._id:", item._id);

    console.log("🚀 ~ Item ~ updateItem ~ item.storeId:", item.storeId);
    if (res.acknowledged === true) {
      return await this.getItemById(item.storeId, item._id);
    }
  }
}

module.exports = Item;
