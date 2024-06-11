require("dotenv").config();
const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");

const {
  typeDefs: userTypeDefs,
  resolvers: userResolvers,
} = require("./schema/user");

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
}).then(({ url }) => {
  console.log(`🚀  Server ready at: ${url}`);
});
