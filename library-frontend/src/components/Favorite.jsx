import { useQuery } from "@apollo/client"
import { BOOKS_WITH_GENRE, LOGGED_USER } from "../queries"
import { useNavigate } from "react-router-dom"

const Favorite = ({ genre }) => {
  /*   const resultUser = useQuery(LOGGED_USER)

  const thisUser = resultUser.data.me

  const genre = thisUser.favoriteGenre */

  const resultRecs = useQuery(BOOKS_WITH_GENRE, {
    variables: { genre },
    skip: !genre,
  })

  if (resultRecs.loading) {
    return <div>Loading...</div>
  }

  if (!genre) {
    return <h2>No favorite genre!</h2>
  }

  return (
    <div>
      <h1>recommendations</h1>

      <div>
        books in your favorite genre <b>{genre}</b>
      </div>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>

          {resultRecs.data
            ? resultRecs.data.allBooks.map((b) => (
                <tr key={b.title}>
                  <td>{b.title}</td>
                  <td>{b.author.name}</td>
                  <td>{b.published}</td>
                </tr>
              ))
            : null}
        </tbody>
      </table>
    </div>
  )
}

export default Favorite
