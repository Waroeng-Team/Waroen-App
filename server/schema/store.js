const Store = require("../models/StoreModels");

const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Store {
    _id: ID
    name: String
    description: String
    phoneNumber: String
    address: String
    since: String
    userId: ID
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    getAllStores: [Store]
    getStoreById(_id: ID): Store
  }

  type Mutation {
    createStore(name: String, description: String, phoneNumber: String, address: String, since: String): Store
    deleteStore(_id: ID): Store
    updateStore(_id: ID): Store
  }
`;

const resolvers = {
    Query: {
        getAllStores: async (_, args, ___) => {
            
        }
    },
    Mutation: {
        createStore: async (_, args, ___) => {
            const { name, description, phoneNumber, address } = args;

            const newStore = { name, description, phoneNumber, address }

            const result = await Store.createStore(newStore);

            return newStore;
        }
    }
}

module.exports = {
    typeDefs,
    resolvers,
}