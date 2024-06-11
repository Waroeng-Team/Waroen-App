require("dotenv").config();
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

const server = new ApolloServer({
  typeDefs: [userTypeDefs, storeTypeDefs], 
  resolvers: [userResolvers, storeResolvers],
  introspection: true,
});

startStandaloneServer(server, {
  listen: { port: process.env.PORT || 3000 },
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
}).then(({ url }) => {
  console.log(`🚀  Server ready at: ${url}`);
});
