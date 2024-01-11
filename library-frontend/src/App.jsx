import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import { BrowserRouter as Router, Link, Route, Routes } from 'react-router-dom'

const App = () => {

  return (
    <Router>
      <div>
        <Link to="/">authors</Link>
        <Link to="/books">books</Link>
        <Link to="/add">add</Link>
      </div>

      <Routes>
        <Route path="/books" element={<Books />} />
        <Route path="/add" element={<NewBook />} />
        <Route path="/" element={<Authors />} />
      </Routes>

    </Router>
  )
}

export default App
