import { useQuery } from '@apollo/client'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import { BrowserRouter as Router, Link, Route, Routes } from 'react-router-dom'
import { ALL_AUTHORS, ALL_BOOKS } from './queries'

const App = () => {

  const resultAuthor = useQuery(ALL_AUTHORS)

  const resultBooks = useQuery(ALL_BOOKS)

  if (resultAuthor.loading || resultBooks.loading)  {
    return <div>loading...</div>
  }

  const authors = resultAuthor.data.allAuthors

  const books = resultBooks.data.allBooks

  return (
    <Router>
      <div>
        <Link to="/">authors </Link>
        <Link to="/books">books </Link>
        <Link to="/add">add </Link>
      </div>

      <Routes>
        <Route path="/books" element={<Books books={books} />} />
        <Route path="/add" element={<NewBook />} />
        <Route path="/" element={<Authors authors={authors}/>} />
      </Routes>

    </Router>
  )
}

export default App
