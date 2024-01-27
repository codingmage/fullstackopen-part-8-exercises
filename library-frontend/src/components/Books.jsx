import { useQuery } from "@apollo/client"
import { useState } from "react"
import { BOOKS_WITH_GENRE } from "../queries"

const Books = ({ books, genres }) => {

  const [genre, setGenre] = useState(null)

  const filteredBooks = useQuery(BOOKS_WITH_GENRE, {
    variables: { genre },
    skip: !genre
  })

  if (filteredBooks.loading) return (
    <div>
      <h2>books</h2>
      <div>Loading...</div>
    </div>
  )

  return (
    <div>
      <h2>books</h2>

      {genre ? <h3>in genre {genre}</h3> : null}

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>

        {(filteredBooks.data) ? 
          filteredBooks.data.allBooks.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))
          :
          books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))} 
        </tbody>
      </table>

      <div>
        {genres.map(thisGenre => <button onClick={() => setGenre(thisGenre)} key={thisGenre}>{thisGenre}</button>)}
      </div>


    </div>
  )
}

export default Books
