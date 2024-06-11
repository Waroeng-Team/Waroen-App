const { ObjectId } = require("mongodb");
const { database } = require("../config/mongodb");

class Store {
    static collection() {
        return database.collection("stores");
    }

    static async getAllStores() {
        return
    }

    static async createStore(newStore) {
        newStore.since = new Date(newStore.since);
        newStore.userId = new ObjectId(newStore.userId)
        const store = await Store.collection().insertOne(newStore);

        return store
    }
}

module.exports = Store;