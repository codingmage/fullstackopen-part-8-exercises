import { useApolloClient, useQuery, useSubscription } from "@apollo/client"
import Authors from "./components/Authors"
import Books from "./components/Books"
import NewBook from "./components/NewBook"
import { BrowserRouter as Router, Link, Route, Routes } from "react-router-dom"
import { ALL_AUTHORS, ALL_BOOKS, BOOK_ADDED, LOGGED_USER } from "./queries"
import { useEffect, useState } from "react"
import LoginForm from "./components/LoginForm"
import Favorite from "./components/Favorite"

export const cacheUpdate = (cache, query, addedBook) => {
  // prevents adding 2 of the same book when updating cache

  const uniqByTitle = (a) => {
    let seen = new Set()
    return a.filter((item) => {
      let k = item.title
      return seen.has(k) ? false : seen.add(k)
    })
  }

  cache.updateQuery(query, ({ allBooks }) => {
    return {
      allBooks: uniqByTitle(allBooks.concat(addedBook)),
    }
  })
}

const App = () => {
  const resultAuthor = useQuery(ALL_AUTHORS)

  const resultBooks = useQuery(ALL_BOOKS)

  const resultUser = useQuery(LOGGED_USER)

  const [token, setToken] = useState(null)
  const [favGenre, setFaveGenre] = useState(null)

  const client = useApolloClient()

  useEffect(() => {
    const userInCache = localStorage.getItem("loggedUser")
    if (userInCache) {
      setToken(userInCache)
    }
  }, [])

  useEffect(() => {
    if (resultUser.loading === false && resultUser.data.me !== null) {
      setFaveGenre(resultUser.data.me.favoriteGenre)
    }
  }, [resultUser])

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.data.bookAdded
      window.alert(`New book ${addedBook.title} added`)

      cacheUpdate(client.cache, { query: ALL_BOOKS }, addedBook)

      /*       client.cache.updateQuery({ query: ALL_BOOKS }, ({ allBooks }) => {
        return {
          allBook: allBooks.concat(addedBook),
        }
      }) */
    },
  })

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  if (resultAuthor.loading || resultBooks.loading) {
    return <div>loading...</div>
  }

  const authors = resultAuthor.data.allAuthors

  const books = resultBooks.data.allBooks

  // const thisUser = resultUser.data.me

  const selectedGenres = books.map((book) => book.genres).flat()

  const trimmedGenres = [...new Set(selectedGenres)]

  return (
    <Router>
      <div>
        <Link to="/">authors </Link>
        <Link to="/books">books </Link>
        {token ? (
          <>
            <Link to="/add">add </Link>
            <Link to="/favorite">recommend</Link>
            <button onClick={logout}>logout</button>
          </>
        ) : (
          <Link to={"/login"}>login</Link>
        )}
      </div>

      <Routes>
        <Route
          path="/books"
          element={<Books books={books} genres={trimmedGenres} />}
        />
        <Route path="/add" element={<NewBook />} />
        <Route path="login" element={<LoginForm setToken={setToken} />} />
        <Route path="/" element={<Authors authors={authors} />} />
        <Route path="favorite" element={<Favorite genre={favGenre} />} />
      </Routes>
    </Router>
  )
}

export default App
