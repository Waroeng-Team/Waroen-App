const { database, ObjectId } = require("../config/mongodb");

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

    const { profit, totalIncome, totalOutcome, transactionIds } =
      transactions.reduce(
        (acc, { _id, total, type }) => {
          if (type === "income") {
            acc.profit += total;
            acc.totalIncome += total;
          } else if (type === "outcome") {
            acc.profit -= total;
            acc.totalOutcome += total;
          }
          acc.transactionIds.push(_id);
          return acc;
        },
        { profit: 0, totalIncome: 0, totalOutcome: 0, transactionIds: [] }
      );

    // const report = await this.reportCollection()
    //   .aggregate([
    //     {
    //       $match: {
    //         storeId,
    //         createdAt: start,
    //       },
    //     },
    //     ...aggregation,
    //   ])
    //   .toArray();

    // if (report.length === 0) {
    //   const newReport = {
    //     storeId,
    //     createdAt: start,
    //     profit,
    //     transactions: transactionIds,
    //     totalIncome,
    //     totalOutcome,
    //   };
    //   await this.reportCollection().insertOne(newReport);
    //   return newReport;
    // }

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

    // Retrieve the report with transaction details
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

  static async getReportByMonth(storeId, date) {
    const start = new Date(date);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);
    end.setHours(23, 59, 59, 999);

    const result = await this.reportCollection()
      .find({
        storeId,
        createdAt: { $gte: start, $lte: end },
      })
      .toArray();
    return result;
  }

  static async getReportByYear(storeId, date) {
    const start = new Date(date);
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setMonth(11, 31);
    end.setHours(23, 59, 59, 999);

    const result = await this.reportCollection()
      .find({
        storeId,
        createdAt: { $gte: start, $lte: end },
      })
      .toArray();
    return result;
  }

  static async createReport(report) {
    const result = await this.reportCollection().insertOne(report);
    return result;
  }
}

module.exports = Report;
