const { createApolloServer } = require("../index");
const { database } = require("../config/mongodb");
const request = require("supertest");
const redis = require("../config/redis");
const { ObjectId } = require("mongodb");
const { signToken } = require("../helpers/jwt");

let server, url;
let token = signToken({ _id: 1, isNewAccount: false });

let dataTransactions = require("../db/transaction.json");
dataTransactions.map((transaction) => {
  transaction._id = new ObjectId(transaction._id);
  transaction.storeId = new ObjectId(transaction.storeId);
  transaction.createdAt = new Date("06-12-2024");
  transaction.items.map((item) => {
    item.itemId = new ObjectId(item.itemId);
    return item;
  });
  return transaction;
});

let dataTransactionsNextDay = require("../db/transactionDifferentDate.json");
dataTransactionsNextDay.map((transaction) => {
  transaction._id = new ObjectId(transaction._id);
  transaction.storeId = new ObjectId(transaction.storeId);
  transaction.createdAt = new Date("06-13-2024");
  transaction.items.map((item) => {
    item.itemId = new ObjectId(item.itemId);
    return item;
  });
  return transaction;
});

let dataItems = require("../db/item.json");
dataItems.map((item) => {
  item._id = new ObjectId(item._id);
  item.storeId = new ObjectId(item.storeId);
  item.createdAt = new Date();
  return item;
});

let dataStores = require("../db/store.json");
dataStores.map((store) => {
  store._id = new ObjectId(store._id);
  store.userId = new ObjectId(store.userId);
  store.since = new Date();
});

beforeAll(async () => {
  ({ server, url } = await createApolloServer({ port: 0 }));
  await database.collection("transactions").insertMany(dataTransactions);
  await database.collection("transactions").insertMany(dataTransactionsNextDay);
  await database.collection("items").insertMany(dataItems);
  await database.collection("stores").insertMany(dataStores);
});

afterAll(async () => {
  await server?.stop();
  await redis.quit();
  await database.collection("transactions").drop();
  await database.collection("items").drop();
  await database.collection("stores").drop();
  await database.collection("reports").drop();
});

describe("Report Query", () => {
  test("Get report by day", async () => {
    const queryData = {
      query: `
      query GetReportByDay($storeId: ID, $date: String) {
        getReportByDay(storeId: $storeId, date: $date) {
          _id
          storeId
          totalIncome
          totalOutcome
          profit
          transactionDetail {
            _id
            storeId
            items {
              itemId
              quantity
            }
            type
            total
            createdAt
          }
          createdAt
          totalItemTransaction {
            date
            income {
              name
              quantity
            }
            outcome {
              name
              quantity
            }
          }
        }
      }`,
      variables: {
        storeId: "66680ebed1d85d8c771c397b",
        date: "2024-06-12",
      },
    };
    const response = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token}`)
      .send(queryData);
    console.log(response.body.data);
    expect(response.status).toBe(200);
    expect(response.body.data.getReportByDay).toHaveProperty(
      "_id",
      expect.any(String)
    );
    expect(response.body.data.getReportByDay).toHaveProperty(
      "storeId",
      expect.any(String)
    );
    expect(response.body.data.getReportByDay).toHaveProperty(
      "totalIncome",
      expect.any(Number)
    );
    expect(response.body.data.getReportByDay).toHaveProperty(
      "totalOutcome",
      expect.any(Number)
    );
    expect(response.body.data.getReportByDay).toHaveProperty(
      "profit",
      expect.any(Number)
    );
    if (response.body.data.getReportByDay.transactionDetail.length > 0) {
      response.body.data.getReportByDay.transactionDetail.forEach(
        (transaction) => {
          expect(transaction).toHaveProperty("_id", expect.any(String));
          expect(transaction).toHaveProperty("storeId", expect.any(String));
          transaction.items.forEach((item) => {
            expect(item).toHaveProperty("itemId", expect.any(String));
            expect(item).toHaveProperty("quantity", expect.any(Number));
          });
          expect(transaction).toHaveProperty("type", expect.any(String));
          expect(transaction).toHaveProperty("total", expect.any(Number));
          expect(transaction).toHaveProperty("createdAt", expect.any(String));
        }
      );
    }
    expect(response.body.data.getReportByDay).toHaveProperty(
      "createdAt",
      expect.any(String)
    );
  });

  test("Get report by week", async () => {
    const queryData = {
      query: `
      query GetReportByWeek($storeId: ID, $date: String) {
        getReportByWeek(storeId: $storeId, date: $date) {
          _id
          storeId
          totalIncome
          totalOutcome
          profit
          transactionDetail {
            _id
            storeId
            items {
              itemId
              quantity
            }
            type
            total
            createdAt
          }
          createdAt
          totalItemTransaction {
            date
            income {
              name
              quantity
            }
            outcome {
              name
              quantity
            }
          }
        }
      }`,
      variables: {
        storeId: "66680ebed1d85d8c771c397b",
        date: "2024-06-12",
      },
    };
    const response = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token}`)
      .send(queryData);
    expect(response.status).toBe(200);
    expect(response.body.data.getReportByWeek).toHaveProperty(
      "_id",
      expect.any(String)
    );
    expect(response.body.data.getReportByWeek).toHaveProperty(
      "storeId",
      expect.any(String)
    );
    expect(response.body.data.getReportByWeek).toHaveProperty(
      "totalIncome",
      expect.any(Number)
    );
    expect(response.body.data.getReportByWeek).toHaveProperty(
      "totalOutcome",
      expect.any(Number)
    );
    expect(response.body.data.getReportByWeek).toHaveProperty(
      "profit",
      expect.any(Number)
    );
    if (response.body.data.getReportByWeek.transactionDetail.length > 0) {
      response.body.data.getReportByWeek.transactionDetail.forEach(
        (transaction) => {
          expect(transaction).toHaveProperty("_id", expect.any(String));
          expect(transaction).toHaveProperty("storeId", expect.any(String));
          transaction.items.forEach((item) => {
            expect(item).toHaveProperty("itemId", expect.any(String));
            expect(item).toHaveProperty("quantity", expect.any(Number));
          });
          expect(transaction).toHaveProperty("type", expect.any(String));
          expect(transaction).toHaveProperty("total", expect.any(Number));
          expect(transaction).toHaveProperty("createdAt", expect.any(String));
        }
      );
    }
    expect(response.body.data.getReportByWeek).toHaveProperty(
      "createdAt",
      expect.any(String)
    );
  });

  test("Get report by month", async () => {
    const queryData = {
      query: `
      query GetReportByMonth($storeId: ID, $date: String) {
        getReportByMonth(storeId: $storeId, date: $date) {
          _id
          storeId
          totalIncome
          totalOutcome
          profit
          transactionDetail {
            _id
            storeId
            items {
              itemId
              quantity
            }
            type
            total
            createdAt
          }
          createdAt
        }
      }`,
      variables: {
        storeId: "66680ebed1d85d8c771c397b",
        date: "2024-06-12",
      },
    };
    const response = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token}`)
      .send(queryData);
    expect(response.status).toBe(200);
    expect(response.body.data.getReportByMonth).toHaveProperty(
      "_id",
      expect.any(String)
    );
    expect(response.body.data.getReportByMonth).toHaveProperty(
      "storeId",
      expect.any(String)
    );
    expect(response.body.data.getReportByMonth).toHaveProperty(
      "totalIncome",
      expect.any(Number)
    );
    expect(response.body.data.getReportByMonth).toHaveProperty(
      "totalOutcome",
      expect.any(Number)
    );
    expect(response.body.data.getReportByMonth).toHaveProperty(
      "profit",
      expect.any(Number)
    );
    if (response.body.data.getReportByMonth.transactionDetail.length > 0) {
      response.body.data.getReportByMonth.transactionDetail.forEach(
        (transaction) => {
          expect(transaction).toHaveProperty("_id", expect.any(String));
          expect(transaction).toHaveProperty("storeId", expect.any(String));
          transaction.items.forEach((item) => {
            expect(item).toHaveProperty("itemId", expect.any(String));
            expect(item).toHaveProperty("quantity", expect.any(Number));
          });
          expect(transaction).toHaveProperty("type", expect.any(String));
          expect(transaction).toHaveProperty("total", expect.any(Number));
          expect(transaction).toHaveProperty("createdAt", expect.any(String));
        }
      );
    }
    expect(response.body.data.getReportByMonth).toHaveProperty(
      "createdAt",
      expect.any(String)
    );
  });

  test("Get report by year", async () => {
    const queryData = {
      query: `
      query GetReportByYear($storeId: ID, $date: String) {
        getReportByYear(storeId: $storeId, date: $date) {
          _id
          storeId
          totalIncome
          totalOutcome
          profit
          transactionDetail {
            _id
            storeId
            items {
              itemId
              quantity
            }
            type
            total
            createdAt
          }
          createdAt
        }
      }`,
      variables: {
        storeId: "66680ebed1d85d8c771c397b",
        date: "2024-06-12",
      },
    };
    const response = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token}`)
      .send(queryData);
    expect(response.status).toBe(200);
    expect(response.body.data.getReportByYear).toHaveProperty(
      "_id",
      expect.any(String)
    );
    expect(response.body.data.getReportByYear).toHaveProperty(
      "storeId",
      expect.any(String)
    );
    expect(response.body.data.getReportByYear).toHaveProperty(
      "totalIncome",
      expect.any(Number)
    );
    expect(response.body.data.getReportByYear).toHaveProperty(
      "totalOutcome",
      expect.any(Number)
    );
    expect(response.body.data.getReportByYear).toHaveProperty(
      "profit",
      expect.any(Number)
    );
    if (response.body.data.getReportByYear.transactionDetail.length > 0) {
      response.body.data.getReportByYear.transactionDetail.forEach(
        (transaction) => {
          expect(transaction).toHaveProperty("_id", expect.any(String));
          expect(transaction).toHaveProperty("storeId", expect.any(String));
          transaction.items.forEach((item) => {
            expect(item).toHaveProperty("itemId", expect.any(String));
            expect(item).toHaveProperty("quantity", expect.any(Number));
          });
          expect(transaction).toHaveProperty("type", expect.any(String));
          expect(transaction).toHaveProperty("total", expect.any(Number));
          expect(transaction).toHaveProperty("createdAt", expect.any(String));
        }
      );
    }
    expect(response.body.data.getReportByYear).toHaveProperty(
      "createdAt",
      expect.any(String)
    );
  });

  test("Get report have new transaction", async () => {
    await database.collection("transactions").insertOne({
      type: "income",
      items: [
        {
          name: "Beng beng",
          sellPrice: 5000,
          buyPrice: 3000,
          quantity: 2,
          itemId: new ObjectId("66698f2ab3ce3549fe6af2f3"),
        },
      ],
      total: 10000,
      storeId: new ObjectId("66680ebed1d85d8c771c397b"),
      createdAt: new Date("06-12-2024"),
    });
    const queryData = {
      query: `
      query GetReportByDay($storeId: ID, $date: String) {
        getReportByDay(storeId: $storeId, date: $date) {
          _id
          storeId
          totalIncome
          totalOutcome
          profit
          transactionDetail {
            _id
            storeId
            items {
              itemId
              quantity
            }
            type
            total
            createdAt
          }
          createdAt
          totalItemTransaction {
            date
            income {
              name
              quantity
            }
            outcome {
              name
              quantity
            }
          }
        }
      }`,
      variables: {
        storeId: "66680ebed1d85d8c771c397b",
        date: "2024-06-12",
      },
    };
    const response = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token}`)
      .send(queryData);
    console.log(response.body.data);
    expect(response.status).toBe(200);
    expect(response.body.data.getReportByDay).toHaveProperty(
      "_id",
      expect.any(String)
    );
    expect(response.body.data.getReportByDay).toHaveProperty(
      "storeId",
      expect.any(String)
    );
    expect(response.body.data.getReportByDay).toHaveProperty(
      "totalIncome",
      expect.any(Number)
    );
    expect(response.body.data.getReportByDay).toHaveProperty(
      "totalOutcome",
      expect.any(Number)
    );
    expect(response.body.data.getReportByDay).toHaveProperty(
      "profit",
      expect.any(Number)
    );
    if (response.body.data.getReportByDay.transactionDetail.length > 0) {
      response.body.data.getReportByDay.transactionDetail.forEach(
        (transaction) => {
          expect(transaction).toHaveProperty("_id", expect.any(String));
          expect(transaction).toHaveProperty("storeId", expect.any(String));
          transaction.items.forEach((item) => {
            expect(item).toHaveProperty("itemId", expect.any(String));
            expect(item).toHaveProperty("quantity", expect.any(Number));
          });
          expect(transaction).toHaveProperty("type", expect.any(String));
          expect(transaction).toHaveProperty("total", expect.any(Number));
          expect(transaction).toHaveProperty("createdAt", expect.any(String));
        }
      );
    }
    expect(response.body.data.getReportByDay).toHaveProperty(
      "createdAt",
      expect.any(String)
    );
  });

  test("Error no transaction", async () => {
    const queryData = {
      query: `
      query GetReportByYear($storeId: ID, $date: String) {
        getReportByYear(storeId: $storeId, date: $date) {
          _id
          storeId
          totalIncome
          totalOutcome
          profit
          transactionDetail {
            _id
            storeId
            items {
              itemId
              quantity
            }
            type
            total
            createdAt
          }
          createdAt
        }
      }`,
      variables: {
        storeId: "66680ebed1d85d8c771c397b",
        date: "2023-06-12",
      },
    };
    const response = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token}`)
      .send(queryData);

    expect(response.body.errors[0]).toHaveProperty(
      "message",
      "No transaction in this time"
    );
  });
});
