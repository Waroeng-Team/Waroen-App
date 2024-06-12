const Transaction = require("../models/TransactionModels");

const transactions = [
  {
    _id: 1,
    type: "income",
    items: [
      { itemId: 1, quantity: 10 },
      { itemId: 2, quantity: 20 },
    ],
    total: 200000,
    createdAt: new Date(),
  },
  {
    _id: 2,
    type: "outcome",
    items: [
      { itemId: 3, quantity: 30 },
      { itemId: 4, quantity: 40 },
    ],
    total: 400000,
    createdAt: new Date(),
  },
];

const typeDefs = `#graphql
type Transaction {
    _id: String
    type: String
    items: [ItemTransaction]
    total: Int
    storeId: ID
    createdAt: String
}

type ItemTransaction {
    itemId: ID,
    quantity: Int
}

input ItemInput {
    itemId: ID
    quantity: Int
}


type Query {
    getAllTransaction(storeId: ID): [Transaction]
    getTransactionById(storeId: ID, transactionId: ID): Transaction
}

type Mutation {
    addtransaction(type: String, items: [ItemInput], storeId: ID): Transaction
}
`;

const resolvers = {
  Query: {
    getAllTransaction: async (parent, args, contextValue) => {
      contextValue.auth();
      const { storeId } = args;
      let result = await Transaction.getAllTransaction(storeId);
      return result;
    },
    getTransactionById: async (parent, args, contextValue) => {
      contextValue.auth();
      const { storeId, transactionId } = args;
      let result = await Transaction.getTransactionById(storeId, transactionId);
      return result;
    },
  },
  Mutation: {
    addtransaction: async (parent, args, contextValue) => {
      contextValue.auth();
      const { type, items, storeId } = args;
      const newTransaction = { type, items, storeId };
      let total = await Transaction.addTransaction(newTransaction);
      return { type, items, total, storeId };
    },
  },
};

module.exports = { typeDefs, resolvers };
