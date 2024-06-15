const { ObjectId } = require("mongodb");
const { database } = require("../config/mongodb");
const redis = require("../config/redis");

class Store {
  static collection() {
    return database.collection("stores");
  }

  static async getAllStores(_id) {
    const stores = await Store.collection()
      .aggregate([
        {
          $match: {
            userId: new ObjectId(_id),
          },
        },
      ])
      .toArray();

    return stores;
  }

  static async getStoreById(_id) {
    const store = await Store.collection().findOne({ _id: new ObjectId(_id) });

    return store;
  }

  static async createStore(newStore) {
    newStore.since = new Date(newStore.since);
    newStore.userId = new ObjectId(newStore.userId);

    if (newStore.name.length === 0)
      throw new Error("Store name cannot be empty");
    if (newStore.description.length === 0)
      throw new Error("Store description cannot be empty");
    if (newStore.phoneNumber.length === 0)
      throw new Error("Store phone number cannot be empty");
    if (newStore.address.length === 0)
      throw new Error("Store address cannot be empty");

    const store = await Store.collection().insertOne(newStore);

    const filter = { _id: new ObjectId(newStore.userId) };
    const updateDoc = {
      $set: {
        isNewAccount: false,
      },
    };

    const updateUser = await database
      .collection("users")
      .updateOne(filter, updateDoc);

    await redis.del("stores");

    return store;
  }

  static async updateStore(
    _id,
    name,
    description,
    phoneNumber,
    address,
    since
  ) {
    since = new Date(since);

    if (name.length === 0) throw new Error("Store name cannot be empty");
    if (description.length === 0)
      throw new Error("Store description cannot be empty");
    if (phoneNumber.length === 0)
      throw new Error("Store phone number cannot be empty");
    if (address.length === 0) throw new Error("Store address cannot be empty");

    const store = await Store.collection().findOneAndUpdate(
      { _id: new ObjectId(_id) },
      {
        $set: {
          name,
          description,
          phoneNumber,
          address,
          since,
        },
      },
      { returnOriginal: false }
    );

    if (!store) throw new Error("Store not found");

    const updatedStore = Store.collection().findOne({ _id: new ObjectId(_id) });

    return updatedStore;
  }

  static async deleteStore(_id) {
    const store = await Store.collection().findOneAndDelete({
      _id: new ObjectId(_id),
    });
    if (!store) throw new Error("Store not found");
  }
}

module.exports = Store;
