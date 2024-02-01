const { ApolloServer } = require("@apollo/server")
/* const { startStandaloneServer } = require("@apollo/server/standalone") */
/* const { v1: uuid } = require("uuid") */
const jwt = require("jsonwebtoken")
const { expressMiddleware } = require("@apollo/server/express4")
const {
  ApolloServerPluginDrainHttpServer,
} = require("@apollo/server/plugin/drainHttpServer")
const { makeExecutableSchema } = require("@graphql-tools/schema")
const express = require("express")
const cors = require("cors")
const http = require("http")
const { WebSocketServer } = require("ws")
const { useServer } = require("graphql-ws/lib/use/ws")

const typeDefs = require("./schema")
const resolvers = require("./resolvers")

const mongoose = require("mongoose")
mongoose.set("strictQuery", false)
const User = require("./models/user")

require("dotenv").config()

const MONGODB_URI = process.env.MONGODB_URI

console.log("connecting to", MONGODB_URI)

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB")
  })
  .catch((error) => {
    console.log("error connection to MongoDB:", error.message)
  })

mongoose.set("debug", true)

const start = async () => {
  const app = express()
  const httpServer = http.createServer(app)

  const wsServer = new WebSocketServer({ server: httpServer, path: "/" })

  const schema = makeExecutableSchema({ typeDefs, resolvers })
  const serverCleanup = useServer({ schema }, wsServer)

  const server = new ApolloServer({
    /* schema: makeExecutableSchema({ typeDefs, resolvers }) */
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose()
            },
          }
        },
      },
    ],
  })

  await server.start()

  app.use(
    "/",
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null
        if (auth && auth.startsWith("Bearer ")) {
          const decodedToken = jwt.verify(
            auth.substring(7),
            process.env.JWT_SECRET
          )
          const loggedInUser = await User.findById(decodedToken.id)
          return { loggedInUser }
        }
      },
    })
  )

  const PORT = 4000

  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

start()

// Replace startStandaloneServer since it can't handle subscriptions

/* const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.startsWith("Bearer ")) {
      const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET)

      const loggedInUser = await User.findById(decodedToken.id)
      return { loggedInUser }
    }
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
 */
