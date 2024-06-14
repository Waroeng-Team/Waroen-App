const { createApolloServer } = require("../index");
const { database } = require("../config/mongodb");
const request = require("supertest");
const redis = require("../config/redis");
const { hashPassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { ObjectId } = require("mongodb");

let userToken;
let userId;

const SECONDS = 1000;
jest.setTimeout(10 * SECONDS)

beforeAll(async () => {
  ({ server, url } = await createApolloServer({ port: 0 }));
  //Seeding User
  let users = require("../db/user.json");
  users = users.map((user) => {
    user.password = hashPassword(user.password);
    user._id = new ObjectId(user._id);
    return user;
  });
  await database.collection("users").insertMany(users);

  //Find 1 user
  let user = await database.collection("users").findOne({
    _id: new ObjectId("666bfc96eb451304a07eb0ba"),
  });

  userId = user._id;
  userToken = signToken({
    _id: user._id,
    isNewAccount: user.isNewAccount,
  });

  //Seeding Store
  let stores = require("../db/store.json");
  stores = stores.map((store) => {
    store._id = new ObjectId(store._id);
    return store;
  });

  await database.collection("stores").insertMany(stores);
});

afterAll(async () => {
  await server?.stop();
  await redis.quit();
  await database.collection("users").drop();
  await database.collection("stores").drop();
});

describe("Store Query", () => {
  test("Get all stores", async () => {
    const queryData = {
      query: `query GetAllStores {
                getAllStores {
                    _id
                    name
                    description
                    phoneNumber
                    address
                    since
                    userId
                }
            }`,
      variables: {},
    };
    const response = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${userToken}`)
      .send(queryData);

    expect(response.status).toBe(200);
    expect(response.body.data.getAllStores).toBeInstanceOf(Array);
    response.body.data.getAllStores.forEach((store) => {
      expect(store).toHaveProperty("_id", expect.any(String));
      expect(store).toHaveProperty("name", expect.any(String));
      expect(store).toHaveProperty("description", expect.any(String));
      expect(store).toHaveProperty("phoneNumber", expect.any(String));
      expect(store).toHaveProperty("address", expect.any(String));
      expect(store).toHaveProperty("since", expect.any(String));
      expect(store).toHaveProperty("userId", expect.any(String));
    });
  });

  test("Get store by id", async () => {
    const queryData = {
      query: `query GetStoreById($id: ID) {
                getStoreById(_id: $id) {
                    _id
                    name
                    description
                    phoneNumber
                    address
                    since
                    userId
                }
            }`,
      variables: {
        "id": "66697c86be63217582250a92"
      },
    };
    const response = await request(url)
      .post('/')
      .set("Authorization", `Bearer ${userToken}`)
      .send(queryData);

    expect(response.status).toBe(200);
    expect(response.body.data.getStoreById).toBeInstanceOf(Object);
    expect(response.body.data.getStoreById).toHaveProperty("_id", expect.any(String));
    expect(response.body.data.getStoreById).toHaveProperty("name", expect.any(String));
    expect(response.body.data.getStoreById).toHaveProperty("description", expect.any(String));
    expect(response.body.data.getStoreById).toHaveProperty("phoneNumber", expect.any(String));
    expect(response.body.data.getStoreById).toHaveProperty("address", expect.any(String));
    expect(response.body.data.getStoreById).toHaveProperty("since", expect.any(String));
    expect(response.body.data.getStoreById).toHaveProperty("userId", expect.any(String));
  });
});
