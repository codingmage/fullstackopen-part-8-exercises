const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { GraphQLError } = require('graphql')
const { v1: uuid } = require("uuid")
const jwt = require('jsonwebtoken')

const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')

require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

let authors = [
  {
    name: 'Robert Martin',
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821
  },
  { 
    name: 'Joshua Kerievsky', // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  { 
    name: 'Sandi Metz', // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
]

/*
 * English:
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
*/

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ['agile', 'patterns', 'design']
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'patterns']
  },  
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'design']
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'crime']
  },
  {
    title: 'The Demon ',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'revolution']
  },
]

/*
  you can remove the placeholder query once your first one has been implemented 
*/

const typeDefs = `

    type User {
      username: String!
      favoriteGenre: String!
      id: ID!
    }

    type Token {
      value: String!
    }

    type Author {
        name: String!
        born: Int
        id: ID!
        bookCount: Int
    }

    type Book {
        title: String!
        author: Author!
        published: Int!
        genres: [String!]
        id: ID!
    }

    type Query {
        bookCount: Int!
        authorCount: Int!
        allBooks(author: String, genre: String): [Book!]!
        allAuthors: [Author!]!
        me: User
    }

    type Mutation {
      addBook(
        title: String!
        author: String!
        published: Int!
        genres: [String!]!
      ) : Book!
      editAuthor(
        name: String!
        setBornTo: Int!
      ) : Author
      createUser(
        username: String!
        favoriteGenre: String!
      ): User
      login(
        username: String!
        password: String!
      ): Token
    }
`

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(), //() => books.length,
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      // https://stackoverflow.com/questions/18148166/find-document-with-array-that-contains-a-specific-value
        if(!args.author && !args.genre) {
          return await Book.find({})
        } else if (args.author && args.genre) {

          const booksByAuthor = books.filter(book => book.author === args.author)

          const booksByGenreAndAuthor = booksByAuthor.filter(book => book.genres.includes(args.genre))

          return booksByGenreAndAuthor

        } else if (args.author) {
          const booksByAuthor = books.filter(book => book.author === args.author)

          return booksByAuthor

        } else if (args.genre) {
          console.log(args.genre)
          // const booksByGenre = await Book.find({ genres: {$all : args.genre } })
          const booksByGenre = await Book.find({ genres: args.genre })
          
          return booksByGenre
        }

    },
    allAuthors: async () => {
/*         const eachAuthor = authors.map(author => {
            const thisAuthorsBooks = books.filter(book => book.author === author.name)
            const authorObject = {name: author.name, bookCount: thisAuthorsBooks.length, born: author.born}
            return authorObject
        }) */

        const eachAuthor = await Author.find({})

        return eachAuthor
    },
    me: (root, args, context) => {
      return context.loggedInUser
    }
  },
  Mutation: {
    addBook: async (root, args) => {

      const loggedUser = context.loggedInUser

      if (!loggedUser) {
          throw new GraphQLError('User not authenticated', {
              extensions: {code: 'BAD_USER_INPUT',} 
          })
      }

      const thisAuthor = await Author.findOne({ name: args.author})

      let selectedAuthor

      if (!thisAuthor) {
        selectedAuthor = new Author({ name: args.author})
        try {
          await selectedAuthor.save()
        } catch (error) {
          throw new GraphQLError('New author is invalid', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.author,
              error 
            } 
          })
        }
      } else {
        selectedAuthor = thisAuthor
      }

      const newBook = new Book({...args, author: selectedAuthor})

      try {
        await newBook.save()
      } catch (error) {
        throw new GraphQLError('Saving new book failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error 
          } 
        } 
      )
      }

      return newBook
    },
      
/*       if (books.find(b => b.title === args.title)) {
        throw new GraphQLError("Name must be unique", {
            extensions: {
                code: "BAD_USER_INPUT",
                invalidArgs: args.title
            }
        })
      }

      const newBook = {...args, id: uuid()}

      const authorExists = authors.some(a => a.name === args.author)

      if (!authorExists) {
        authors = authors.concat({name: args.author, id: uuid()})
      }

      books = books.concat(newBook)
      return newBook }, */
    editAuthor: async (root, args) => {

      const loggedUser = context.loggedInUser

      if (!loggedUser) {
          throw new GraphQLError('User not authenticated', {
              extensions: {code: 'BAD_USER_INPUT',} 
          })
      }

      const author = await Author.findOne({ name: args.name })

      if(!author) {
        return null
      }

      author.born = args.setBornTo

      // authors = authors.map(author => author.name === args.name ? updatedAuthor : author)

      try {
        await author.save()
      } catch (error) {
        throw new GraphQLError('Updating author failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error
          }
        })
      }

      return author
    },
    createUser: async (root, args) => {
      const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })
  
      return user.save()
        .catch(error => {
          throw new GraphQLError('Creating the user failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.username,
              error
            }
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
  
      if ( !user || args.password !== 'password' ) {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })        
      }
  
      const userForToken = {
        username: user.username,
        favoriteGenre: user.favoriteGenre,
        id: user._id,
      }
  
      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    },
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({req, res}) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.startsWith("Bearer ")) {
        const decodedToken = jwt.verify(
            auth.substring(7), process.env.JWT_SECRET
        )

        const loggedInUser = await User.findById(decodedToken.id)
        return { loggedInUser }
    }
  }
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})