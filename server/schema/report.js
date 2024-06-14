const { ObjectId } = require("mongodb");
const Report = require("../models/ReportModels");

const typeDefs = `#graphql

  type Report {
    _id: ID
    createdAt: String
    # transactions: [ID]
    totalIncome: Int
    totalOutcome: Int
    profit: Int
    storeId: ID
    transactionDetail: [Transaction]
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
      contextValue.auth();
      let result = await Report.getReportByDay(new ObjectId(storeId), date);
      return result;
    },
    getReportByMonth: async (_, { storeId, date }, contextValue) => {
      contextValue.auth();
      let result = await Report.getReportByMonth(new ObjectId(storeId), date);
      return result;
    },
    getReportByYear: async (_, { storeId, date }, contextValue) => {
      contextValue.auth();
      let result = await Report.getReportByYear(new ObjectId(storeId), date);
      return result;
    },
  },
};

module.exports = { typeDefs, resolvers };
