const { ObjectId } = require("mongodb");
const { database } = require("../config/mongodb");

class Store {
    static collection() {
        return database.collection("stores");
    }

    static async getAllStores(_id) {
        const stores = await Store.collection()
        .aggregate([
            {
                '$match': {
                  'userId': new ObjectId(_id)
                }
              }
        ]).toArray();

        return stores;
    }

    static async getStoreById(_id) {
        const store = await Store.collection().findOne({ _id: new ObjectId(_id) });

        return store;
    }

    static async createStore(newStore) {
        newStore.since = new Date(newStore.since);
        newStore.userId = new ObjectId(newStore.userId)
        const store = await Store.collection().insertOne(newStore);

        return store
    }

    static async updateStore(_id, name, description, phoneNumber, address, since) {
        since = new Date(since);
        const store = await Store.collection().findOneAndUpdate(
            { _id: new ObjectId(_id) },
            {
                $set: {
                    name,
                    description,
                    phoneNumber,
                    address,
                    since
                }
            },
            { returnOriginal: false }
        );

        const updatedStore = Store.collection().findOne({ _id: new ObjectId(_id) });

        return updatedStore;
    }
    
    static async deleteStore(_id) {
        await Store.collection().findOneAndDelete({ _id: new ObjectId(_id) });
    }
}

module.exports = Store;