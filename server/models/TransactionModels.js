const { ObjectId } = require("mongodb");
const { database } = require("../config/mongodb");

class Transaction {
  static async addTransaction(newTransaction) {
    if (!newTransaction.type) {
      throw new Error("Type is required");
    }

    if (!newTransaction.items[0]) {
      throw new Error("Items is required");
    }

    let total = 0;
    for (const e of newTransaction.items) {
      let item = await database
        .collection("items")
        .findOne({ _id: new ObjectId(e.itemId) });

      total += item.sellPrice * e.quantity;

      let newStock = item.stock - e.quantity;

      let updateStock = await database.collection("items").updateOne(
        { _id: new ObjectId(e.itemId) },
        {
          $set: { stock: newStock },
        }
      );
    }
    let items = newTransaction.items.map((e) => {
      e.itemId = new ObjectId(e.itemId);
      return e;
    });

    await database.collection("transactions").insertOne({
      type: newTransaction.type,
      items,
      total,
      createdAt: new Date(),
    });
    return total;
  }
}

module.exports = Transaction;
