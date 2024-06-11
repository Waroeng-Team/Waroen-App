require("dotenv").config();
const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");

const {
  typeDefs: userTypeDefs,
  resolvers: userResolvers,
} = require("./schema/user");

const server = new ApolloServer({
  typeDefs: [userTypeDefs],
  resolvers: [userResolvers],
  introspection: true,
});

startStandaloneServer(server, {
  listen: { port: process.env.PORT || 3000 },
}).then(({ url }) => {
  console.log(`🚀  Server ready at: ${url}`);
});
