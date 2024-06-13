const { ObjectId } = require("mongodb");
const Report = require("../models/ReportModels");

const typeDefs = `#graphql

  type Report {
    id: ID
    createdAt: String
    transactions: [Transaction]
    income: Int
    outcome: Int
    profit: Int
    storeId: ID
  }

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

  type Query {
    getReportByDay(storeId: ID, date: String): Report
    getReportByMonth(storeId: ID, date: String): Report
    getReportByYear(storeId: ID, date: String): Report
  }
`;

const resolvers = {
  Query: {
    getReportByDay: async (_, { storeId, date }, contextValue) => {
      // Implement your logic here
      contextValue.auth();
      let result = await Report.getReportByDay(new ObjectId(storeId), date);
      return result;
    },
    getReportByMonth: async (_, { storeId, date }) => {
      // Implement your logic here
    },
    getReportByYear: async (_, { storeId, date }) => {
      // Implement your logic here
    },
  },
};

module.exports = { typeDefs, resolvers };
