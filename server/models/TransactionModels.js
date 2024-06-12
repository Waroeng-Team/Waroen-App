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
      if (newTransaction.type == "income") {
        total += item.sellPrice * e.quantity;

        let newStock = item.stock - e.quantity;

        await database.collection("items").updateOne(
          { _id: new ObjectId(e.itemId) },
          {
            $set: { stock: newStock },
          }
        );
      }

      if (newTransaction.type == "outcome") {
        total += item.buyPrice * e.quantity;

        let newStock = item.stock + e.quantity;

        await database.collection("items").updateOne(
          { _id: new ObjectId(e.itemId) },
          {
            $set: { stock: newStock },
          }
        );
      }
    }
    let items = newTransaction.items.map((e) => {
      e.itemId = new ObjectId(e.itemId);
      return e;
    });

    await database.collection("transactions").insertOne({
      type: newTransaction.type,
      items,
      total,
      storeId: new ObjectId(newTransaction.storeId),
      createdAt: new Date(),
    });
    return total;
  }

  static async getAllTransaction(storeId) {
    let result = await database
      .collection("transactions")
      .find({ storeId: new ObjectId(storeId) })
      .toArray();
    return result;
  }

  static async getTransactionById(storeId, transactionId) {
    let result = await database
      .collection("transactions")
      .findOne({
        _id: new ObjectId(transactionId),
        storeId: new ObjectId(storeId),
      })
    return result;
  }
}

module.exports = Transaction;
