const { database } = require("../config/mongodb");

class Report {
  static reportCollection() {
    return database.collection("reports");
  }

  static transactionCollection() {
    return database.collection("transactions");
  }

  //* ─── Get By Day ──────────────────────────────────────────────────────
  static async getReportByDay(storeId, date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const transactions = await this.transactionCollection()
      .find({
        storeId,
        createdAt: { $gte: start, $lte: end },
      })
      .toArray();

    const { profit, income, outcome, transactionIds } = transactions.reduce(
      (acc, { _id, total, type }) => {
        if (type === "income") {
          acc.profit += total;
          acc.income += total;
        } else if (type === "outcome") {
          acc.profit -= total;
          acc.outcome += total;
        }
        acc.transactionIds.push(_id);
        return acc;
      },
      { profit: 0, income: 0, outcome: 0, transactionIds: [] }
    );

    const result = await this.reportCollection().findOne({
      storeId,
      createdAt: start,
    });

    if (!result) {
      const newReport = {
        storeId,
        createdAt: start,
        profit,
        transactions: transactionIds,
        income,
        outcome,
      };
      await this.reportCollection().insertOne(newReport);
      return newReport;
    }

    return result;
  }

  static async getReportByMonth(storeId, date) {
    const result = await this.reportCollection()
      .find({ storeId, createdAt: month })
      .toArray();
    return result;
  }

  static async getReportByYear(storeId, date) {
    const result = await this.reportCollection()
      .find({ storeId, createdAt: year })
      .toArray();
    return result;
  }

  static async createReport(report) {
    const result = await this.reportCollection().insertOne(report);
    return result;
  }
}

module.exports = Report;
