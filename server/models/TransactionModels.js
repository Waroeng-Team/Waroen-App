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
      // console.log(item);
      if (newTransaction.type == "income") {
        if (item.stock < e.quantity) {
          throw new Error(
            "Can't add " + item.name + " more then " + item.stock
          );
        }
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
    let itemsPromises = newTransaction.items.map(async (e) => {
      let itemId = new ObjectId(e.itemId);
      const agg = [
        {
          $match: {
            _id: itemId,
          },
        },
        {
          $unset: [
            "imageUrl",
            "description",
            "category",
            "createdAt",
            "storeId",
            "barcode",
            "stock",
            "_id",
          ],
        },
      ];
      const coll = database.collection("items");
      const cursor = coll.aggregate(agg);
      const result = await cursor.toArray();
      result[0].quantity = e.quantity;
      result[0].itemId = new ObjectId(e.itemId);
      return result[0];
    });

    let items = await Promise.all(itemsPromises);

    await database.collection("transactions").insertOne({
      type: newTransaction.type,
      items,
      total,
      storeId: new ObjectId(newTransaction.storeId),
      createdAt: new Date(),
    });
    return { items, total };
  }

  static async getAllTransaction(storeId) {
    const agg = [
      {
        $match: {
          storeId: new ObjectId(storeId),
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ];
    const cursor = database.collection("transactions").aggregate(agg);
    const result = await cursor.toArray();
    // let result = await database
    //   .collection("transactions")
    //   .find({ storeId: new ObjectId(storeId) })
    //   .toArray();
    return result;
  }

  static async getTransactionById(storeId, transactionId) {
    let result = await database.collection("transactions").findOne({
      _id: new ObjectId(transactionId),
      storeId: new ObjectId(storeId),
    });
    return result;
  }
}

module.exports = Transaction;
