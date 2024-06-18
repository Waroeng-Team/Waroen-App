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
    // console.log(
    //   "🚀 ~ Report ~ generateAndSaveReport ~ transactions:",
    //   transactions
    // );

    if (!transactions.length) throw new Error("No transaction in this time");

    const { profit, totalIncome, totalOutcome, transactionIds } =
      profitReport(transactions);
    // console.log(transactions[19])

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

    if (
      report[0] &&
      report[0].transactionDetail.length !== transactionIds.length
    ) {
      await this.reportCollection().deleteOne({ storeId, createdAt: start });
      return this.generateAndSaveReport(storeId, start, end);
    }
    // console.log(report[0])

    return report[0];
  }

  //! INFO PENTING
  //? buat get data nya, format input date adalah string dengan contoh format "2024-06-12T15:41:53.340+00:00"
  //? contoh get data by day: sesuaikan dengan tanggalnya
  //? contoh get data by week: random tanggal dari minggu tersebut. data diambil dari senin
  //? contoh get data by month: random tanggal dari bulan tersebut. di sini sudah di atur untuk ngambil bulan tersebut
  //? contoh get data by year: random tanggal dari tahun tersebut. di sini sudah di atur untuk ngambil tahun tersebut

  //* ─── Get Dayly ──────────────────────────────────────────────────────
  static async getReportByDay(storeId, date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    let data = await this.generateAndSaveReport(storeId, start, end);
    let transactionDetail = [];
    data.transactionDetail.forEach((transaction) => {
      let date = `${transaction.createdAt}`;
      date = date.split(" ");
      let convertDate = [date[2], date[1], date[3]];
      convertDate = convertDate.join("-");
      if (!transactionDetail.some((td) => td.date === convertDate)) {
        transactionDetail.push({ date: convertDate, income: [], outcome: [] });
      }
      transactionDetail.forEach((newTransaction) => {
        if (newTransaction.date === convertDate) {
          if (transaction.type == "income") {
            transaction.items.forEach((item) => {
              let existingItem = newTransaction.income.find(
                (i) => i.name === item.name
              );
              if (existingItem) {
                existingItem.quantity += item.quantity;
              } else {
                newTransaction.income.push({
                  name: item.name,
                  quantity: item.quantity,
                });
              }
            });
          }
          if (transaction.type == "outcome") {
            transaction.items.forEach((item) => {
              let existingItem = newTransaction.outcome.find(
                (i) => i.name === item.name
              );
              if (existingItem) {
                existingItem.quantity += item.quantity;
              } else {
                newTransaction.outcome.push({
                  name: item.name,
                  quantity: item.quantity,
                });
              }
            });
          }
        }
      });
    });
    data.totalItemTransaction = transactionDetail;
    return data;
  }

  //* ─── Get Weekly ─────────────────────────────────────────────────────
  static async getReportByWeek(storeId, date) {
    const currentDate = new Date(date);
    const dayOfWeek = (currentDate.getUTCDay() + 6) % 7;
    const start = new Date(currentDate);
    start.setUTCDate(currentDate.getUTCDate() - dayOfWeek);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 6);
    end.setUTCHours(23, 59, 59, 999);
    let data = await this.generateAndSaveReport(storeId, start, end);
    let transactionDetail = [];
    data.transactionDetail.forEach((transaction) => {
      let date = `${transaction.createdAt}`;
      date = date.split(" ");
      let convertDate = [date[2], date[1], date[3]];
      convertDate = convertDate.join("-");
      if (!transactionDetail.some((td) => td.date === convertDate)) {
        transactionDetail.push({ date: convertDate, income: [], outcome: [] });
      }
      transactionDetail.forEach((newTransaction) => {
        if (newTransaction.date === convertDate) {
          if (transaction.type == "income") {
            transaction.items.forEach((item) => {
              let existingItem = newTransaction.income.find(
                (i) => i.name === item.name
              );
              if (existingItem) {
                existingItem.quantity += item.quantity;
              } else {
                newTransaction.income.push({
                  name: item.name,
                  quantity: item.quantity,
                });
              }
            });
          }
          if (transaction.type == "outcome") {
            transaction.items.forEach((item) => {
              let existingItem = newTransaction.outcome.find(
                (i) => i.name === item.name
              );
              if (existingItem) {
                existingItem.quantity += item.quantity;
              } else {
                newTransaction.outcome.push({
                  name: item.name,
                  quantity: item.quantity,
                });
              }
            });
          }
        }
      });
    });
    data.totalItemTransaction = transactionDetail;
    return data;
  }

  //* ─── Get Monthly ────────────────────────────────────────────────────
  static async getReportByMonth(storeId, date) {
    const start = new Date(date);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);
    end.setHours(23, 59, 59, 999);
    let data = await this.generateAndSaveReport(storeId, start, end);
    let transactionDetail = [];
    data.transactionDetail.forEach((transaction) => {
      let date = `${transaction.createdAt}`;
      date = date.split(" ");
      let convertDate = [date[2], date[1], date[3]];
      convertDate = convertDate.join("-");
      if (!transactionDetail.some((td) => td.date === convertDate)) {
        transactionDetail.push({ date: convertDate, income: [], outcome: [] });
      }
      transactionDetail.forEach((newTransaction) => {
        if (newTransaction.date === convertDate) {
          if (transaction.type == "income") {
            transaction.items.forEach((item) => {
              let existingItem = newTransaction.income.find(
                (i) => i.name === item.name
              );
              if (existingItem) {
                existingItem.quantity += item.quantity;
              } else {
                newTransaction.income.push({
                  name: item.name,
                  quantity: item.quantity,
                });
              }
            });
          }
          if (transaction.type == "outcome") {
            transaction.items.forEach((item) => {
              let existingItem = newTransaction.outcome.find(
                (i) => i.name === item.name
              );
              if (existingItem) {
                existingItem.quantity += item.quantity;
              } else {
                newTransaction.outcome.push({
                  name: item.name,
                  quantity: item.quantity,
                });
              }
            });
          }
        }
      });
    });
    data.totalItemTransaction = transactionDetail;
    return data;
  }

  //* ─── Get Yearly ─────────────────────────────────────────────────────
  static async getReportByYear(storeId, date) {
    const start = new Date(date);
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setMonth(11, 31);
    end.setHours(23, 59, 59, 999);
    let data = await this.generateAndSaveReport(storeId, start, end);
    let transactionDetail = [];
    data.transactionDetail.forEach((transaction) => {
      let date = `${transaction.createdAt}`;
      date = date.split(" ");
      let convertDate = [date[2], date[1], date[3]];
      convertDate = convertDate.join("-");
      if (!transactionDetail.some((td) => td.date === convertDate)) {
        transactionDetail.push({ date: convertDate, income: [], outcome: [] });
      }
      transactionDetail.forEach((newTransaction) => {
        if (newTransaction.date === convertDate) {
          if (transaction.type == "income") {
            transaction.items.forEach((item) => {
              let existingItem = newTransaction.income.find(
                (i) => i.name === item.name
              );
              if (existingItem) {
                existingItem.quantity += item.quantity;
              } else {
                newTransaction.income.push({
                  name: item.name,
                  quantity: item.quantity,
                });
              }
            });
          }
          if (transaction.type == "outcome") {
            transaction.items.forEach((item) => {
              let existingItem = newTransaction.outcome.find(
                (i) => i.name === item.name
              );
              if (existingItem) {
                existingItem.quantity += item.quantity;
              } else {
                newTransaction.outcome.push({
                  name: item.name,
                  quantity: item.quantity,
                });
              }
            });
          }
        }
      });
    });
    data.totalItemTransaction = transactionDetail;
    return data;
  }
}

module.exports = Report;
