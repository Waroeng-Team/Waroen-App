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
  transaction.createdAt = new Date();
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

beforeAll(async () => {
  ({ server, url } = await createApolloServer({ port: 0 }));
  await database.collection("transactions").insertMany(dataTransactions);
  await database.collection("items").insertMany(dataItems);
});

afterAll(async () => {
  await server?.stop();
  await redis.quit();
  await database.collection("transactions").drop();
  await database.collection("items").drop();
});

describe("Transaction Query", () => {
  test("Get all transactions", async () => {
    const queryData = {
      query: `
      query GetAllTransaction($storeId: ID) {
        getAllTransaction(storeId: $storeId) {
          _id
          storeId
          type
          items {
            itemId
            quantity
          }
          total
          createdAt
        }
      }`,
      variables: { storeId: "66680ebed1d85d8c771c397b" },
    };
    const response = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token}`)
      .send(queryData);
    expect(response.status).toBe(200);
    expect(response.body.data.getAllTransaction).toBeInstanceOf(Array);
    if (response.body.data.getAllTransaction.length > 0) {
      response.body.data.getAllTransaction.forEach((transaction) => {
        expect(transaction).toHaveProperty("_id", expect.any(String));
        expect(transaction).toHaveProperty("storeId", expect.any(String));
        expect(transaction).toHaveProperty("type", expect.any(String));
        expect(transaction.items).toBeInstanceOf(Array);
        transaction.items.forEach((item) => {
          expect(item).toHaveProperty("itemId", expect.any(String));
          expect(item).toHaveProperty("quantity", expect.any(Number));
        });
        expect(transaction).toHaveProperty("total", expect.any(Number));
        expect(transaction).toHaveProperty("createdAt", expect.any(String));
      });
    }
  });

  test("Get transaction by id", async () => {
    const queryData = {
      query: `
      query GetTransactionById($storeId: ID, $transactionId: ID) {
        getTransactionById(storeId: $storeId, transactionId: $transactionId) {
          _id
          storeId
          type
          items {
            itemId
            quantity
          }
          total
          createdAt
        }
      }`,
      variables: {
        storeId: "66680ebed1d85d8c771c397b",
        transactionId: "6669c1a39e93dacf3fdc0d7d",
      },
    };
    const response = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token}`)
      .send(queryData);
    expect(response.status).toBe(200);
    expect(response.body.data.getTransactionById).toHaveProperty(
      "_id",
      expect.any(String)
    );
    expect(response.body.data.getTransactionById).toHaveProperty(
      "storeId",
      expect.any(String)
    );
    expect(response.body.data.getTransactionById).toHaveProperty(
      "type",
      expect.any(String)
    );
    expect(response.body.data.getTransactionById).toHaveProperty(
      "items",
      expect.any(Array)
    );
    expect(response.body.data.getTransactionById).toHaveProperty(
      "total",
      expect.any(Number)
    );
    expect(response.body.data.getTransactionById).toHaveProperty(
      "createdAt",
      expect.any(String)
    );
  });

  describe("Success add transaction", () => {
    test("Add transaction income", async () => {
      const queryData = {
        query: `
      mutation Addtransaction($type: String, $storeId: ID, $items: [ItemInput]) {
        addtransaction(type: $type, storeId: $storeId, items: $items) {
          _id
          storeId
          type
          items {
            itemId
            quantity
          }
          total
          createdAt
        }
      }`,
        variables: {
          type: "income",
          items: [
            {
              itemId: "66698f2ab3ce3549fe6af2f3",
              quantity: 1,
            },
          ],
          storeId: "66680ebed1d85d8c771c397b",
        },
      };
      const response = await request(url)
        .post("/")
        .set("Authorization", `Bearer ${token}`)
        .send(queryData);
      expect(response.status).toBe(200);
      expect(response.body.data.addtransaction).toHaveProperty(
        "items",
        expect.any(Array)
      );
      expect(response.body.data.addtransaction).toHaveProperty(
        "total",
        expect.any(Number)
      );
      expect(response.body.data.addtransaction).toHaveProperty(
        "type",
        expect.any(String)
      );
      expect(response.body.data.addtransaction).toHaveProperty(
        "storeId",
        expect.any(String)
      );
    });

    test("Add transaction outcome", async () => {
      const queryData = {
        query: `
      mutation Addtransaction($type: String, $storeId: ID, $items: [ItemInput]) {
        addtransaction(type: $type, storeId: $storeId, items: $items) {
          _id
          storeId
          type
          items {
            itemId
            quantity
          }
          total
          createdAt
        }
      }`,
        variables: {
          type: "outcome",
          items: [
            {
              itemId: "66698f2ab3ce3549fe6af2f3",
              quantity: 1,
            },
          ],
          storeId: "66680ebed1d85d8c771c397b",
        },
      };
      const response = await request(url)
        .post("/")
        .set("Authorization", `Bearer ${token}`)
        .send(queryData);
      expect(response.status).toBe(200);
      expect(response.body.data.addtransaction).toHaveProperty(
        "items",
        expect.any(Array)
      );
      expect(response.body.data.addtransaction).toHaveProperty(
        "total",
        expect.any(Number)
      );
      expect(response.body.data.addtransaction).toHaveProperty(
        "type",
        expect.any(String)
      );
      expect(response.body.data.addtransaction).toHaveProperty(
        "storeId",
        expect.any(String)
      );
    });
  });

  describe("Failed add transaction", () => {
    test("Empty type", async () => {
      const queryData = {
        query: `
      mutation Addtransaction($type: String, $storeId: ID, $items: [ItemInput]) {
        addtransaction(type: $type, storeId: $storeId, items: $items) {
          _id
          storeId
          type
          items {
            itemId
            quantity
          }
          total
          createdAt
        }
      }`,
        variables: {
          type: "",
          items: [
            {
              itemId: "66698f2ab3ce3549fe6af2f3",
              quantity: 1,
            },
          ],
          storeId: "66680ebed1d85d8c771c397b",
        },
      };
      const response = await request(url)
        .post("/")
        .set("Authorization", `Bearer ${token}`)
        .send(queryData);
      expect(response.body.errors[0]).toHaveProperty(
        "message",
        "Type is required"
      );
    });

    test("Empty type", async () => {
      const queryData = {
        query: `
      mutation Addtransaction($type: String, $storeId: ID, $items: [ItemInput]) {
        addtransaction(type: $type, storeId: $storeId, items: $items) {
          _id
          storeId
          type
          items {
            itemId
            quantity
          }
          total
          createdAt
        }
      }`,
        variables: {
          type: "income",
          items: [],
          storeId: "66680ebed1d85d8c771c397b",
        },
      };
      const response = await request(url)
        .post("/")
        .set("Authorization", `Bearer ${token}`)
        .send(queryData);
      expect(response.body.errors[0]).toHaveProperty(
        "message",
        "Items is required"
      );
    });

    test("Empty token", async () => {
      const queryData = {
        query: `
      mutation Addtransaction($type: String, $storeId: ID, $items: [ItemInput]) {
        addtransaction(type: $type, storeId: $storeId, items: $items) {
          _id
          storeId
          type
          items {
            itemId
            quantity
          }
          total
          createdAt
        }
      }`,
        variables: {
          type: "income",
          items: [
            {
              itemId: "66698f2ab3ce3549fe6af2f3",
              quantity: 1,
            },
          ],
          storeId: "66680ebed1d85d8c771c397b",
        },
      };
      const response = await request(url).post("/").send(queryData);
      expect(response.body.errors[0]).toHaveProperty("message", "Unauthorized");
    });

    test("Invalid token", async () => {
      const queryData = {
        query: `
      mutation Addtransaction($type: String, $storeId: ID, $items: [ItemInput]) {
        addtransaction(type: $type, storeId: $storeId, items: $items) {
          _id
          storeId
          type
          items {
            itemId
            quantity
          }
          total
          createdAt
        }
      }`,
        variables: {
          type: "income",
          items: [
            {
              itemId: "66698f2ab3ce3549fe6af2f3",
              quantity: 1,
            },
          ],
          storeId: "66680ebed1d85d8c771c397b",
        },
      };
      const response = await request(url)
        .post("/")
        .set("Authorization", `Beare ${token}`)
        .send(queryData);
      expect(response.body.errors[0]).toHaveProperty("message", "Unauthorized");
    });
  });
});
