const { database, ObjectId } = require("../config/mongodb");
const profitReport = require("../helpers/profitReport");

const aggregation = [
  {
    $lookup: {
      from: "transactions",
      let: {
        transactionIds: "$transactions",
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $in: ["$_id", "$$transactionIds"],
            },
          },
        },
      ],
      as: "transactionDetail",
    },
  },
  {
    $unset: "transactions",
  },
];

class Report {
  static reportCollection() {
    return database.collection("reports");
  }

  static async getTransaction(storeId, start, end) {
    return await database
      .collection("transactions")
      .find({
        storeId,
        createdAt: { $gte: start, $lte: end },
      })
      .toArray();
  }

  //! ─── Search Or Create ────────────────────────────────────────────────
  static async generateAndSaveReport(storeId, start, end) {
    const transactions = await this.getTransaction(storeId, start, end);
    const { profit, totalIncome, totalOutcome, transactionIds } =
      profitReport(transactions);

    const newReport = {
      storeId,
      createdAt: start,
      profit,
      transactions: transactionIds,
      totalIncome,
      totalOutcome,
    };

    await this.reportCollection().updateOne(
      { storeId, createdAt: start },
      { $setOnInsert: newReport },
      { upsert: true }
    );

    const report = await this.reportCollection()
      .aggregate([
        {
          $match: {
            storeId,
            createdAt: start,
          },
        },
        ...aggregation,
      ])
      .toArray();

    return report[0];
  }

  //* ─── Get By Day ──────────────────────────────────────────────────────
  static async getReportByDay(storeId, date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return this.generateAndSaveReport(storeId, start, end);
  }

  //* ─── Get By Month ────────────────────────────────────────────────────
  static async getReportByMonth(storeId, date) {
    const start = new Date(date);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);
    end.setHours(23, 59, 59, 999);
    return this.generateAndSaveReport(storeId, start, end);
  }

  //* ─── Get By Year ─────────────────────────────────────────────────────
  static async getReportByYear(storeId, date) {
    const start = new Date(date);
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setMonth(11, 31);
    end.setHours(23, 59, 59, 999);

    return this.generateAndSaveReport(storeId, start, end);
  }
}

module.exports = Report;
