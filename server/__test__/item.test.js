const { createApolloServer } = require("../index");
const { database } = require("../config/mongodb");
const request = require("supertest");
const redis = require("../config/redis");
const { ObjectId } = require("mongodb");
const { signToken } = require("../helpers/jwt");

let server, url;
let token = signToken({ _id: 1, isNewAccount: false });

let dataItems = require("../db/item.json");
dataItems.map((item) => {
  item._id = new ObjectId(item._id);
  item.storeId = new ObjectId(item.storeId);
  item.createdAt = new Date();
  return item;
});

beforeAll(async () => {
  ({ server, url } = await createApolloServer({ port: 0 }));
  await database.collection("items").drop();
  await database.collection("items").insertMany(dataItems);
});

afterAll(async () => {
  await server?.stop();
  await redis.quit();
  await database.collection("items").drop();
});

describe("Item Query", () => {
  describe("Success get item", () => {
    test("Get all item", async () => {
      const queryData = {
        query: `
      query GetAllItems($storeId: ID!) {
        getAllItems(storeId: $storeId) {
          _id
          name
          description
          category
          imageUrl
          stock
          buyPrice
          sellPrice
          storeId
          barcode
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
      expect(response.body.data.getAllItems).toBeInstanceOf(Array);
      if (response.body.data.getAllItems.length > 0) {
        response.body.data.getAllItems.forEach((item) => {
          expect(item).toHaveProperty("_id", expect.any(String));
          expect(item).toHaveProperty("name", expect.any(String));
          expect(item).toHaveProperty("description", expect.any(String));
          expect(item).toHaveProperty("category", expect.any(String));
          expect(item).toHaveProperty("imageUrl", expect.any(String));
          expect(item).toHaveProperty("stock", expect.any(Number));
          expect(item).toHaveProperty("buyPrice", expect.any(Number));
          expect(item).toHaveProperty("sellPrice", expect.any(Number));
          expect(item).toHaveProperty("storeId", expect.any(String));
          expect(item).toHaveProperty("createdAt", expect.any(String));
        });
      }
    });

    test("Get item by id", async () => {
      const queryData = {
        query: `
      query GetItemById($storeId: ID!, $productId: ID!) {
        getItemById(storeId: $storeId, productId: $productId) {
          _id
          name
          description
          imageUrl
          category
          stock
          buyPrice
          sellPrice
          storeId
          barcode
          createdAt
        }
      }`,
        variables: {
          storeId: "66680ebed1d85d8c771c397b",
          productId: "66698f2ab3ce3549fe6af2f3",
        },
      };
      const response = await request(url)
        .post("/")
        .set("Authorization", `Bearer ${token}`)
        .send(queryData);
      expect(response.status).toBe(200);
      expect(response.body.data.getItemById).toHaveProperty(
        "_id",
        expect.any(String)
      );
      expect(response.body.data.getItemById).toHaveProperty(
        "name",
        expect.any(String)
      );
      expect(response.body.data.getItemById).toHaveProperty(
        "description",
        expect.any(String)
      );
      expect(response.body.data.getItemById).toHaveProperty(
        "category",
        expect.any(String)
      );
      expect(response.body.data.getItemById).toHaveProperty(
        "imageUrl",
        expect.any(String)
      );
      expect(response.body.data.getItemById).toHaveProperty(
        "stock",
        expect.any(Number)
      );
      expect(response.body.data.getItemById).toHaveProperty(
        "buyPrice",
        expect.any(Number)
      );
      expect(response.body.data.getItemById).toHaveProperty(
        "sellPrice",
        expect.any(Number)
      );
      expect(response.body.data.getItemById).toHaveProperty(
        "storeId",
        expect.any(String)
      );
      expect(response.body.data.getItemById).toHaveProperty(
        "createdAt",
        expect.any(String)
      );
    });
  });

  describe("Failed get item", () => {
    test("Failed get all item", async () => {
      const queryData = {
        query: `
      query GetAllItems($storeId: ID!) {
        getAllItems(storeId: $storeId) {
          _id
          name
          description
          category
          imageUrl
          stock
          buyPrice
          sellPrice
          storeId
          barcode
          createdAt
        }
      }`,
        variables: { storeId: "" },
      };
      const response = await request(url)
        .post("/")
        .set("Authorization", `Bearer ${token}`)
        .send(queryData);
      expect(response.body.errors[0]).toHaveProperty(
        "message",
        "Please provide a storeId"
      );
    });

    test("Failed get item by id", async () => {
      const queryData = {
        query: `
      query GetItemById($storeId: ID!, $productId: ID!) {
        getItemById(storeId: $storeId, productId: $productId) {
          _id
          name
          description
          imageUrl
          category
          stock
          buyPrice
          sellPrice
          storeId
          barcode
          createdAt
        }
      }`,
        variables: {
          storeId: "",
          productId: "",
        },
      };
      const response = await request(url)
        .post("/")
        .set("Authorization", `Bearer ${token}`)
        .send(queryData);
      expect(response.body.errors[0]).toHaveProperty(
        "message",
        "Please provide a storeId and productId"
      );
    });
  });

  describe("Success add and update item", () => {
    test("Add item", async () => {
      const queryData = {
        query: `
      mutation CreateItem($name: String!, $imageUrl: String!, $description: String!, $category: String!, $stock: Int!, $buyPrice: Int!, $sellPrice: Int!, $createdAt: String!, $storeId: ID!) {
        createItem(name: $name, imageUrl: $imageUrl, description: $description, category: $category, stock: $stock, buyPrice: $buyPrice, sellPrice: $sellPrice, createdAt: $createdAt, storeId: $storeId) {
          _id
          name
          imageUrl
          description
          category
          buyPrice
          sellPrice
          stock
          storeId
          barcode
          createdAt
        }
      }`,
        variables: {
          name: "ayam",
          imageUrl:
            "https://asset.kompas.com/crops/TfUM4Aft1Jxz-uSdBF-W7Gwtj0k=/0x0:4246x2831/750x500/data/photo/2021/12/11/61b4a4c236bdc.jpg",
          description: "binatang",
          category: "hewan",
          stock: 5,
          buyPrice: 50000,
          sellPrice: 70000,
          createdAt: "2021-04-28T06:09:02.911Z",
          storeId: "66680ebed1d85d8c771c397b",
        },
      };
      const response = await request(url)
        .post("/")
        .set("Authorization", `Bearer ${token}`)
        .send(queryData);
      expect(response.status).toBe(200);
      expect(response.body.data.createItem).toHaveProperty(
        "_id",
        expect.any(String)
      );
      expect(response.body.data.createItem).toHaveProperty(
        "name",
        expect.any(String)
      );
      expect(response.body.data.createItem).toHaveProperty(
        "description",
        expect.any(String)
      );
      expect(response.body.data.createItem).toHaveProperty(
        "category",
        expect.any(String)
      );
      expect(response.body.data.createItem).toHaveProperty(
        "imageUrl",
        expect.any(String)
      );
      expect(response.body.data.createItem).toHaveProperty(
        "stock",
        expect.any(Number)
      );
      expect(response.body.data.createItem).toHaveProperty(
        "buyPrice",
        expect.any(Number)
      );
      expect(response.body.data.createItem).toHaveProperty(
        "sellPrice",
        expect.any(Number)
      );
      expect(response.body.data.createItem).toHaveProperty(
        "storeId",
        expect.any(String)
      );
      expect(response.body.data.createItem).toHaveProperty(
        "createdAt",
        expect.any(String)
      );
    });

    test("Update item", async () => {
      const queryData = {
        query: `
      mutation UpdateItem($updateItemId: ID!, $name: String!, $imageUrl: String!, $description: String!, $category: String!, $stock: Int!, $buyPrice: Int!, $sellPrice: Int!, $storeId: ID!) {
        updateItem(id: $updateItemId, name: $name, imageUrl: $imageUrl, description: $description, category: $category, stock: $stock, buyPrice: $buyPrice, sellPrice: $sellPrice, storeId: $storeId) {
          _id
          name
          description
          category
          imageUrl
          stock
          buyPrice
          sellPrice
          storeId
          createdAt
        }
      }`,
        variables: {
          updateItemId: "66698f2ab3ce3549fe6af2f3",
          name: "sapi",
          imageUrl:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Toro_25M.jpg/640px-Toro_25M.jpg",
          description: "jadi sapi",
          category: "hewan",
          stock: 10,
          buyPrice: 500000,
          sellPrice: 1000000,
          storeId: "66680ebed1d85d8c771c397b",
        },
      };
      const response = await request(url)
        .post("/")
        .set("Authorization", `Bearer ${token}`)
        .send(queryData);
      expect(response.status).toBe(200);
      expect(response.body.data.updateItem).toHaveProperty(
        "_id",
        expect.any(String)
      );
      expect(response.body.data.updateItem).toHaveProperty(
        "name",
        expect.any(String)
      );
      expect(response.body.data.updateItem).toHaveProperty(
        "description",
        expect.any(String)
      );
      expect(response.body.data.updateItem).toHaveProperty(
        "category",
        expect.any(String)
      );
      expect(response.body.data.updateItem).toHaveProperty(
        "imageUrl",
        expect.any(String)
      );
      expect(response.body.data.updateItem).toHaveProperty(
        "stock",
        expect.any(Number)
      );
      expect(response.body.data.updateItem).toHaveProperty(
        "buyPrice",
        expect.any(Number)
      );
      expect(response.body.data.updateItem).toHaveProperty(
        "sellPrice",
        expect.any(Number)
      );
      expect(response.body.data.updateItem).toHaveProperty(
        "storeId",
        expect.any(String)
      );
      expect(response.body.data.updateItem).toHaveProperty(
        "createdAt",
        expect.any(String)
      );
    });
  });

  describe("Failed add and update item", () => {
    test("Failed add item", async () => {
      const queryData = {
        query: `
      mutation CreateItem($name: String!, $imageUrl: String!, $description: String!, $category: String!, $stock: Int!, $buyPrice: Int!, $sellPrice: Int!, $createdAt: String!, $storeId: ID!) {
        createItem(name: $name, imageUrl: $imageUrl, description: $description, category: $category, stock: $stock, buyPrice: $buyPrice, sellPrice: $sellPrice, createdAt: $createdAt, storeId: $storeId) {
          _id
          name
          imageUrl
          description
          category
          buyPrice
          sellPrice
          stock
          storeId
          barcode
          createdAt
        }
      }`,
        variables: {
          name: "",
          imageUrl: "",
          description: "",
          category: "",
          stock: 5,
          buyPrice: 50000,
          sellPrice: 70000,
          createdAt: "",
          storeId: "",
        },
      };
      const response = await request(url)
        .post("/")
        .set("Authorization", `Bearer ${token}`)
        .send(queryData);
      expect(response.body.errors[0]).toHaveProperty(
        "message",
        "Please fill all the fields which are required"
      );
    });

    test("Failed update item", async () => {
      const queryData = {
        query: `
      mutation UpdateItem($updateItemId: ID!, $name: String!, $imageUrl: String!, $description: String!, $category: String!, $stock: Int!, $buyPrice: Int!, $sellPrice: Int!, $storeId: ID!) {
        updateItem(id: $updateItemId, name: $name, imageUrl: $imageUrl, description: $description, category: $category, stock: $stock, buyPrice: $buyPrice, sellPrice: $sellPrice, storeId: $storeId) {
          _id
          name
          description
          category
          imageUrl
          stock
          buyPrice
          sellPrice
          storeId
          createdAt
        }
      }`,
        variables: {
          updateItemId: "",
          name: "",
          imageUrl: "",
          description: "",
          category: "",
          stock: 10,
          buyPrice: 500000,
          sellPrice: 1000000,
          storeId: "",
        },
      };
      const response = await request(url)
        .post("/")
        .set("Authorization", `Bearer ${token}`)
        .send(queryData);
      expect(response.body.errors[0]).toHaveProperty(
        "message",
        "Please fill all the fields which are required"
      );
    });
  });
});
