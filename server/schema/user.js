const User = require("../models/UserModels");

const users = [
  {
    _id: 1,
    name: "user1",
    email: "user1@gmail.com",
    password: "123456",
  },
  {
    _id: 2,
    name: "user2",
    email: "user2@gmail.com",
    password: "123456",
  },
];

const typeDefs = `#graphql
type User {
    _id: ID
    name: String
    email: String
    password: String
}

type AccessToken {
    access_token: String
}

type Query {
    users: [User]
}

type Mutation {
    register(name: String, email: String, password: String): User
    login(email: String, password: String): AccessToken
}
`;

const resolvers = {
  Query: {
    users: () => users,
  },
  Mutation: {
    register: async (parent, args) => {
      const { name, email, password } = args;
      const newUser = { name, email, password };
      await User.register(newUser);
      return newUser;
    },
    login: async (parent, args) => {
      const { email, password } = args;
      const user = { email, password };
      let result = await User.login(user);
      return result;
    },
  },
};

module.exports = { typeDefs, resolvers };
