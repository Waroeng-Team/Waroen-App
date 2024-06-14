const { createApolloServer } = require("../index");
const request = require("supertest");

let server, url;

beforeAll(async () => {
  ({ server, url } = await createApolloServer({ port: 0 }));
});

afterAll(async () => {
  await server?.stop();
});

describe("User Query", () => {
  test("get all test users", async () => {
    const queryData = {
      query: `query Users {
        users {
          _id
          email
          name
          password
        }
      }`,
      variables: {},
    };
    const response = await request(url).post("/").send(queryData);
    expect(response.status).toBe(200);
    expect(response.body.data.users.length).toBe(2);
    response.body.data.users.forEach((user) => {
      expect(user).toHaveProperty("_id", expect.any(String));
      expect(user).toHaveProperty("email", expect.any(String));
      expect(user).toHaveProperty("name", expect.any(String));
      expect(user).toHaveProperty("password", expect.any(String));
    });
  });
  describe("Succes Login", () => {
    test("Login", async () => {
      const queryData = {
        query: `
      mutation Login($email: String, $password: String) {
        login(email: $email, password: $password) {
            access_token
        }
    }`,
        variables: { email: "ilham@mail.com", password: "123456" },
      };
      const response = await request(url).post("/").send(queryData);
      // expect(response.status).toBe(200);
      expect(response.body.data.login).toHaveProperty(
        "access_token",
        expect.any(String)
      );
    });
  });

  describe("Failed Login", () => {
    test("Empty email", async () => {
      const queryData = {
        query: `
      mutation Login($email: String, $password: String) {
        login(email: $email, password: $password) {
            access_token
        }
    }`,
        variables: { email: "", password: "123456" },
      };
      const response = await request(url).post("/").send(queryData);
      // expect(response.status).toBe(200);
      expect(response.body.errors[0]).toHaveProperty(
        "message",
        "Email is required"
      );
    });

    test("Empty password", async () => {
      const queryData = {
        query: `
      mutation Login($email: String, $password: String) {
        login(email: $email, password: $password) {
            access_token
        }
    }`,
        variables: { email: "ilham@mail.com", password: "" },
      };
      const response = await request(url).post("/").send(queryData);
      // expect(response.status).toBe(200);
      expect(response.body.errors[0]).toHaveProperty(
        "message",
        "Password is required"
      );
    });

    test("Invalid email", async () => {
      const queryData = {
        query: `
      mutation Login($email: String, $password: String) {
        login(email: $email, password: $password) {
            access_token
        }
    }`,
        variables: { email: "ilam@mail.com", password: "123456" },
      };
      const response = await request(url).post("/").send(queryData);
      // expect(response.status).toBe(200);
      expect(response.body.errors[0]).toHaveProperty(
        "message",
        "Invalid email/password"
      );
    });

    test("Invalid password", async () => {
      const queryData = {
        query: `
      mutation Login($email: String, $password: String) {
        login(email: $email, password: $password) {
            access_token
        }
    }`,
        variables: { email: "ilham@mail.com", password: "12345" },
      };
      const response = await request(url).post("/").send(queryData);
      // expect(response.status).toBe(200);
      expect(response.body.errors[0]).toHaveProperty(
        "message",
        "Invalid email/password"
      );
    });
  });

  describe("Success Register", () => {
    test("Register", async () => {
      const queryData = {
        query: `
      mutation Register($name: String, $email: String, $password: String) {
        register(name: $name, email: $email, password: $password) {
          _id
          email
          name
          password
        }
      }`,
        variables: {
          name: "test1",
          email: "test1@mail.com",
          password: "123456",
        },
      };
      const response = await request(url).post("/").send(queryData);
      expect(response.status).toBe(200);
      expect(response.body.data.register).toHaveProperty(
        "_id",
        expect.any(String)
      );
      expect(response.body.data.register).toHaveProperty(
        "email",
        expect.any(String)
      );
      expect(response.body.data.register).toHaveProperty(
        "name",
        expect.any(String)
      );
      expect(response.body.data.register).toHaveProperty(
        "password",
        expect.any(String)
      );
    });
  });

  describe("Failed Register", () => {
    test("Empty name", async () => {
      const queryData = {
        query: `
      mutation Register($name: String, $email: String, $password: String) {
        register(name: $name, email: $email, password: $password) {
          _id
          email
          name
          password
        }
      }`,
        variables: {
          name: "",
          email: "test1@mail.com",
          password: "123456",
        },
      };
      const response = await request(url).post("/").send(queryData);
      // expect(response.status).toBe(200);
      expect(response.body.errors[0]).toHaveProperty(
        "message",
        "Name is required"
      );
    });

    test("Empty email", async () => {
      const queryData = {
        query: `
      mutation Register($name: String, $email: String, $password: String) {
        register(name: $name, email: $email, password: $password) {
          _id
          email
          name
          password
        }
      }`,
        variables: {
          name: "test1",
          email: "",
          password: "123456",
        },
      };
      const response = await request(url).post("/").send(queryData);
      // expect(response.status).toBe(200);
      expect(response.body.errors[0]).toHaveProperty(
        "message",
        "Email is required"
      );
    });

    test("Invalid email format", async () => {
      const queryData = {
        query: `
      mutation Register($name: String, $email: String, $password: String) {
        register(name: $name, email: $email, password: $password) {
          _id
          email
          name
          password
        }
      }`,
        variables: {
          name: "test1",
          email: "test1mail.com",
          password: "123456",
        },
      };
      const response = await request(url).post("/").send(queryData);
      // expect(response.status).toBe(200);
      expect(response.body.errors[0]).toHaveProperty(
        "message",
        "Invalid email format"
      );
    });

    test("Empty password", async () => {
      const queryData = {
        query: `
      mutation Register($name: String, $email: String, $password: String) {
        register(name: $name, email: $email, password: $password) {
          _id
          email
          name
          password
        }
      }`,
        variables: {
          name: "test1",
          email: "test1@mail.com",
          password: "",
        },
      };
      const response = await request(url).post("/").send(queryData);
      // expect(response.status).toBe(200);
      expect(response.body.errors[0]).toHaveProperty(
        "message",
        "Password is required"
      );
    });

    test("Duplicate email", async () => {
      const queryData = {
        query: `
      mutation Register($name: String, $email: String, $password: String) {
        register(name: $name, email: $email, password: $password) {
          _id
          email
          name
          password
        }
      }`,
        variables: {
          name: "test1",
          email: "test1@mail.com",
          password: "123456",
        },
      };
      const response = await request(url).post("/").send(queryData);
      // expect(response.status).toBe(200);
      expect(response.body.errors[0]).toHaveProperty(
        "message",
        "Email already registered"
      );
    });

    test("Minimal password", async () => {
      const queryData = {
        query: `
      mutation Register($name: String, $email: String, $password: String) {
        register(name: $name, email: $email, password: $password) {
          _id
          email
          name
          password
        }
      }`,
        variables: {
          name: "test2",
          email: "test2@mail.com",
          password: "123",
        },
      };
      const response = await request(url).post("/").send(queryData);
      // expect(response.status).toBe(200);
      expect(response.body.errors[0]).toHaveProperty(
        "message",
        "Password length minimal 5 character"
      );
    });
  });
});
