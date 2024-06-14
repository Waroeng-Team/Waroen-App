const { createApolloServer } = require("../index");
const { database } = require("../config/mongodb");
const request = require("supertest");
const redis = require("../config/redis");
const { hashPassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { ObjectId } = require("mongodb");

let userToken;
let userId;

beforeAll(async () => {
  jest.setTimeout(60000);
  ({ server, url } = await createApolloServer({ port: 0 }));
  //Seeding User
  let users = require("../db/user.json");
  users = users.map((user) => {
    user.password = hashPassword(user.password);
    user._id = new ObjectId(user._id);
    return user;
  });
  await database.collection("users").drop();
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
  await database.collection("stores").drop();
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
        id: "66697c86be63217582250a92",
      },
    };
    const response = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${userToken}`)
      .send(queryData);

    expect(response.status).toBe(200);
    expect(response.body.data.getStoreById).toBeInstanceOf(Object);
    expect(response.body.data.getStoreById).toHaveProperty(
      "_id",
      expect.any(String)
    );
    expect(response.body.data.getStoreById).toHaveProperty(
      "name",
      expect.any(String)
    );
    expect(response.body.data.getStoreById).toHaveProperty(
      "description",
      expect.any(String)
    );
    expect(response.body.data.getStoreById).toHaveProperty(
      "phoneNumber",
      expect.any(String)
    );
    expect(response.body.data.getStoreById).toHaveProperty(
      "address",
      expect.any(String)
    );
    expect(response.body.data.getStoreById).toHaveProperty(
      "since",
      expect.any(String)
    );
    expect(response.body.data.getStoreById).toHaveProperty(
      "userId",
      expect.any(String)
    );
  });

  describe("Create Store", () => {
    describe("Success create store", () => {
      test("Create store", async () => {
        const queryData = {
          query: `mutation CreateStore($name: String, $description: String, $phoneNumber: String, $address: String, $since: String) {
                    createStore(name: $name, description: $description, phoneNumber: $phoneNumber, address: $address, since: $since) {
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
            name: "Denden Mushi Store",
            description: "Ini toko Denden Mushi Store",
            phoneNumber: "08123123123",
            address: "Jl. Pangkal Kaya",
            since: "2000",
          },
        };
        const response = await request(url)
          .post("/")
          .set("Authorization", `Bearer ${userToken}`)
          .send(queryData);

        expect(response.status).toBe(200);
        expect(response.body.data.createStore).toBeInstanceOf(Object);
        expect(response.body.data.createStore).toHaveProperty("_id", expect.any(String));
        expect(response.body.data.createStore).toHaveProperty("name", expect.any(String));
        expect(response.body.data.createStore).toHaveProperty("description", expect.any(String));
        expect(response.body.data.createStore).toHaveProperty("phoneNumber", expect.any(String));
        expect(response.body.data.createStore).toHaveProperty("address", expect.any(String));
        expect(response.body.data.createStore).toHaveProperty("since", expect.any(String));
        expect(response.body.data.createStore).toHaveProperty("userId", expect.any(String));
      });
    });

    describe("Failed create store", () => {
      test("Unauthorized", async () => {
        const queryData = {
          query: `mutation CreateStore($name: String, $description: String, $phoneNumber: String, $address: String, $since: String) {
                    createStore(name: $name, description: $description, phoneNumber: $phoneNumber, address: $address, since: $since) {
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
            name: "Denden Mushi Store",
            description: "Ini toko Denden Mushi Store",
            phoneNumber: "08123123123",
            address: "Jl. Pangkal Kaya",
            since: "2000",
          },
        };
        const response = await request(url).post("/").send(queryData);

        expect(response.status).toBe(200);
        expect(response.body.errors).toBeInstanceOf(Array);
        expect(response.body.errors[0]).toHaveProperty(
          "message",
          "Unauthorized"
        );
      });
    });

    test("Failed create store : Store cannot empty", async () => {
      const queryData = {
        query: `mutation CreateStore($name: String, $description: String, $phoneNumber: String, $address: String, $since: String) {
                  createStore(name: $name, description: $description, phoneNumber: $phoneNumber, address: $address, since: $since) {
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
          name: "",
          description: "Ini toko Denden Mushi Store",
          phoneNumber: "08123123123",
          address: "Jl. Pangkal Kaya",
          since: "2000"
        },
      };
      const response = await request(url)
        .post("/")
        .set("Authorization", `Bearer ${userToken}`)
        .send(queryData);

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors[0]).toHaveProperty("message", "Store name cannot be empty");
    });

    test("Failed create store : Description cannot empty", async () => {
      const queryData = {
        query: `mutation CreateStore($name: String, $description: String, $phoneNumber: String, $address: String, $since: String) {
                  createStore(name: $name, description: $description, phoneNumber: $phoneNumber, address: $address, since: $since) {
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
          name: "Denden Mushi Store",
          description: "",
          phoneNumber: "08123123123",
          address: "Jl. Pangkal Kaya",
          since: "2000"
        },
      };
      const response = await request(url)
        .post("/")
        .set("Authorization", `Bearer ${userToken}`)
        .send(queryData);

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors[0]).toHaveProperty("message", "Store description cannot be empty");
    });

    test("Failed create store : Phone Number cannot empty", async () => {
      const queryData = {
        query: `mutation CreateStore($name: String, $description: String, $phoneNumber: String, $address: String, $since: String) {
                  createStore(name: $name, description: $description, phoneNumber: $phoneNumber, address: $address, since: $since) {
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
          name: "Denden Mushi Store",
          description: "Ini toko Denden Mushi Store",
          phoneNumber: "",
          address: "Jl. Pangkal Kaya",
          since: "2000"
        },
      };
      const response = await request(url)
        .post("/")
        .set("Authorization", `Bearer ${userToken}`)
        .send(queryData);

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors[0]).toHaveProperty("message", "Store phone number cannot be empty");
    });

    test("Failed create store : Address cannot empty", async () => {
      const queryData = {
        query: `mutation CreateStore($name: String, $description: String, $phoneNumber: String, $address: String, $since: String) {
                  createStore(name: $name, description: $description, phoneNumber: $phoneNumber, address: $address, since: $since) {
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
          name: "Denden Mushi Store",
          description: "Ini toko Denden Mushi Store",
          phoneNumber: "08123123123",
          address: "",
          since: "2000"
        },
      };
      const response = await request(url)
        .post("/")
        .set("Authorization", `Bearer ${userToken}`)
        .send(queryData);

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors[0]).toHaveProperty("message", "Store address cannot be empty");
    });
  });

  describe("Update Store", () => {
    describe("Success update store", () => {
      test("Update store", async () => {
        const queryData = {
          query:`mutation UpdateStore($name: String, $description: String, $phoneNumber: String, $address: String, $since: String, $id: ID) {
                  updateStore(name: $name, description: $description, phoneNumber: $phoneNumber, address: $address, since: $since, _id: $id) {
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
            name: "Gelak Tawa Store",
            description: "Ini adalah Gelak Tawa Store",
            phoneNumber: "08321321321",
            address: "Jl. Pangkal Pensil",
            since: "now",
            id: "66697c86be63217582250a92"
          }
        }
        const response = await request(url)
        .post("/")
        .set("Authorization", `Bearer ${userToken}`)
        .send(queryData);

        expect(response.status).toBe(200);
        expect(response.body.data.updateStore).toBeInstanceOf(Object);
        expect(response.body.data.updateStore).toHaveProperty("_id", expect.any(String));
        expect(response.body.data.updateStore).toHaveProperty("name", expect.any(String));
        expect(response.body.data.updateStore).toHaveProperty("description", expect.any(String));
        expect(response.body.data.updateStore).toHaveProperty("phoneNumber", expect.any(String));
        expect(response.body.data.updateStore).toHaveProperty("address", expect.any(String));
        expect(response.body.data.updateStore).toHaveProperty("since", expect.any(String));
        expect(response.body.data.updateStore).toHaveProperty("userId", expect.any(String));
      });
    });

    describe("Failed update store", () => {
      describe("Unauthorized", () => {
        test("Unauthorized", async () => {
          const queryData = {
            query:`mutation UpdateStore($name: String, $description: String, $phoneNumber: String, $address: String, $since: String, $id: ID) {
                    updateStore(name: $name, description: $description, phoneNumber: $phoneNumber, address: $address, since: $since, _id: $id) {
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
              name: "Gelak Tawa Store",
              description: "Ini adalah Gelak Tawa Store",
              phoneNumber: "08321321321",
              address: "Jl. Pangkal Pensil",
              since: "now",
              id: "66697c86be63217582250a92"
            }
          }
          const response = await request(url)
          .post("/")
          .send(queryData);

          expect(response.status).toBe(200);
          expect(response.body.errors).toBeInstanceOf(Array);
          expect(response.body.errors[0]).toHaveProperty("message", "Unauthorized");
        });

        test("Failed update store : Store cannot empty", async () => {
          const queryData = {
            query:`mutation UpdateStore($name: String, $description: String, $phoneNumber: String, $address: String, $since: String, $id: ID) {
                    updateStore(name: $name, description: $description, phoneNumber: $phoneNumber, address: $address, since: $since, _id: $id) {
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
              name: "",
              description: "Ini adalah Gelak Tawa Store",
              phoneNumber: "08321321321",
              address: "Jl. Pangkal Pensil",
              since: "now",
              id: "66697c86be63217582250a92"
            }
          }
          const response = await request(url)
          .post("/")
          .set("Authorization", `Bearer ${userToken}`)
          .send(queryData);

          expect(response.status).toBe(200);
          expect(response.body.errors).toBeInstanceOf(Array);
          expect(response.body.errors[0]).toHaveProperty("message", "Store name cannot be empty");
        });

        test("Failed update store : Description cannot empty", async () => {
          const queryData = {
            query:`mutation UpdateStore($name: String, $description: String, $phoneNumber: String, $address: String, $since: String, $id: ID) {
                    updateStore(name: $name, description: $description, phoneNumber: $phoneNumber, address: $address, since: $since, _id: $id) {
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
              name: "Gelak Tawa Store",
              description: "",
              phoneNumber: "08321321321",
              address: "Jl. Pangkal Pensil",
              since: "now",
              id: "66697c86be63217582250a92"
            }
          }
          const response = await request(url)
          .post("/")
          .set("Authorization", `Bearer ${userToken}`)
          .send(queryData);

          expect(response.status).toBe(200);
          expect(response.body.errors).toBeInstanceOf(Array);
          expect(response.body.errors[0]).toHaveProperty("message", "Store description cannot be empty");
        });

        test("Failed update store : Phone Number cannot empty", async () => {
          const queryData = {
            query:`mutation UpdateStore($name: String, $description: String, $phoneNumber: String, $address: String, $since: String, $id: ID) {
                    updateStore(name: $name, description: $description, phoneNumber: $phoneNumber, address: $address, since: $since, _id: $id) {
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
              name: "Gelak Tawa Store",
              description: "Ini adalah Gelak Tawa Store",
              phoneNumber: "",
              address: "Jl. Pangkal Pensil",
              since: "now",
              id: "66697c86be63217582250a92"
            }
          }
          const response = await request(url)
          .post("/")
          .set("Authorization", `Bearer ${userToken}`)
          .send(queryData);

          expect(response.status).toBe(200);
          expect(response.body.errors).toBeInstanceOf(Array);
          expect(response.body.errors[0]).toHaveProperty("message", "Store phone number cannot be empty");
        });

        test("Failed update store : Address cannot empty", async () => {
          const queryData = {
            query:`mutation UpdateStore($name: String, $description: String, $phoneNumber: String, $address: String, $since: String, $id: ID) {
                    updateStore(name: $name, description: $description, phoneNumber: $phoneNumber, address: $address, since: $since, _id: $id) {
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
              name: "Gelak Tawa Store",
              description: "Ini adalah Gelak Tawa Store",
              phoneNumber: "08321321321",
              address: "",
              since: "now",
              id: "66697c86be63217582250a92"
            }
          }
          const response = await request(url)
          .post("/")
          .set("Authorization", `Bearer ${userToken}`)
          .send(queryData);

          expect(response.status).toBe(200);
          expect(response.body.errors).toBeInstanceOf(Array);
          expect(response.body.errors[0]).toHaveProperty("message", "Store address cannot be empty");
        });

        test("Failed update store : Store Not Found", async () => {
          const queryData = {
            query:`mutation UpdateStore($name: String, $description: String, $phoneNumber: String, $address: String, $since: String, $id: ID) {
                    updateStore(name: $name, description: $description, phoneNumber: $phoneNumber, address: $address, since: $since, _id: $id) {
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
              name: "Gelak Tawa Store",
              description: "Ini adalah Gelak Tawa Store",
              phoneNumber: "08321321321",
              address: "Jl. Pangkal Pensil",
              since: "now",
              id: "66697c86be632175822222c2"
            }
          }
          const response = await request(url)
          .post("/")
          .set("Authorization", `Bearer ${userToken}`)
          .send(queryData);

          expect(response.status).toBe(200);
          expect(response.body.errors).toBeInstanceOf(Array);
          expect(response.body.errors[0]).toHaveProperty("message", "Store not found");
        });
      });
    });
  });

  describe("Delete Store", () => {
    describe("Success delete store", () => {
      test("Success delete store", async () => {
        const queryData = {
          query:`mutation DeleteStore($id: ID) {
                  deleteStore(_id: $id) {
                    message
                  }
                }`,
          variables: {
            id : "66697c86be63217582250a92"
          }
        }
        const response = await request(url)
        .post("/")
        .set("Authorization", `Bearer ${userToken}`)
        .send(queryData);

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty("deleteStore");
        expect(response.body.data.deleteStore).toHaveProperty("message", `Store with id 66697c86be63217582250a92 has successfully deleted`);
      });      
    });

    describe("Failed delete store", () => {
      test("Unauthorized", async () => {
        const queryData = {
          query:`mutation DeleteStore($id: ID) {
                  deleteStore(_id: $id) {
                    message
                  }
                }`,
          variables: {
            id : "66697c86be63217582250a92"
          }
        }
        const response = await request(url)
        .post("/")
        .send(queryData);
        
        expect(response.status).toBe(200);
        expect(response.body.errors).toBeInstanceOf(Array);
        expect(response.body.errors[0]).toHaveProperty("message", "Unauthorized");
      });

      test("Store not found", async () => {
        const queryData = {
          query:`mutation DeleteStore($id: ID) {
                  deleteStore(_id: $id) {
                    message
                  }
                }`,
          variables: {
            id : "66697c86be632175822222c2"
          }
        }
        const response = await request(url)
        .post("/")
        .set("Authorization", `Bearer ${userToken}`)
        .send(queryData);
        
        expect(response.status).toBe(200);
        expect(response.body.errors).toBeInstanceOf(Array);
        expect(response.body.errors[0]).toHaveProperty("message", "Store not found");
      });
    });
  });
});
