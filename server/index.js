if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");

const {
  typeDefs: userTypeDefs,
  resolvers: userResolvers,
} = require("./schema/user");
const { verifyToken } = require("./helpers/jwt");

const {
  typeDefs: storeTypeDefs,
  resolvers: storeResolvers,
} = require("./schema/store");

const {
  typeDefs: transactionTypeDefs,
  resolvers: transactionResolvers,
} = require("./schema/transaction");

const {
  typeDefs: itemTypeDefs,
  resolvers: itemResolvers,
} = require("./schema/item");

const {
  typeDefs: reportTypeDefs,
  resolvers: reportResolvers,
} = require("./schema/report");

async function createApolloServer({ port } = { port: 3000 }) {
  const server = new ApolloServer({
    typeDefs: [
      userTypeDefs,
      storeTypeDefs,
      transactionTypeDefs,
      itemTypeDefs,
      reportTypeDefs,
    ],
    resolvers: [
      userResolvers,
      storeResolvers,
      transactionResolvers,
      itemResolvers,
      reportResolvers,
    ],
    introspection: true,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: process.env.PORT || port },
    context: async ({ req, res }) => {
      return {
        auth: () => {
          const authen = req.headers.authorization;
          if (!authen) {
            throw new Error("Unauthorized");
          }

          const [type, token] = authen.split(" ");
          if (type !== "Bearer") {
            throw new Error("Unauthorized");
          }

          const decoded = verifyToken(token);
          return decoded;
        },
      };
    },
  });
  console.log(`🚀  Server ready at: ${url}`);
  return {
    server,
    url,
  };
}

if (process.env.NODE_ENV !== "test") {
  createApolloServer();
}

module.exports = { createApolloServer };
