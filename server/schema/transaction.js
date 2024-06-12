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
    # _id: String
    type: String
    items: [ItemTransaction]
    total: Int
    # createdAt: String
}

type ItemTransaction {
    itemId: String,
    quantity: Int
}

input ItemInput {
    itemId: String
    quantity: Int
}


type Query {
    transactions: [Transaction]
}

type Mutation {
    addtransaction(type: String, items: [ItemInput]): Transaction
}
`;

const resolvers = {
  Query: {
    transactions: () => transactions,
  },
  Mutation: {
    addtransaction: async (parent, args) => {
      const { type, items } = args;
      const newTransaction = { type, items };
      let total = await Transaction.addTransaction(newTransaction);
      return { type, items, total };
    },
  },
};

module.exports = { typeDefs, resolvers };
