import { useApolloClient, useQuery } from "@apollo/client"
import Authors from "./components/Authors"
import Books from "./components/Books"
import NewBook from "./components/NewBook"
import { BrowserRouter as Router, Link, Route, Routes } from "react-router-dom"
import { ALL_AUTHORS, ALL_BOOKS, LOGGED_USER } from "./queries"
import { useEffect, useState } from "react"
import LoginForm from "./components/LoginForm"
import Favorite from "./components/Favorite"

const App = () => {
  const resultAuthor = useQuery(ALL_AUTHORS)

  const resultBooks = useQuery(ALL_BOOKS)

  const resultUser = useQuery(LOGGED_USER)

  const [token, setToken] = useState(null)

  const client = useApolloClient()

  useEffect(() => {
    const userInCache = localStorage.getItem("loggedUser")
    if (userInCache) {
      setToken(userInCache)
    }
  }, [])

  const logout = () => {
    setToken(null)
    setCurrentUser(null)
    localStorage.clear()
    client.resetStore()
  }

  if (resultAuthor.loading || resultBooks.loading || resultUser.loading) {
    return <div>loading...</div>
  }

  const authors = resultAuthor.data.allAuthors

  const books = resultBooks.data.allBooks

  const thisUser = resultUser.data.me

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
        <Route
          path="favorite"
          element={<Favorite genre={thisUser.favoriteGenre} />}
        />
      </Routes>
    </Router>
  )
}

export default App
