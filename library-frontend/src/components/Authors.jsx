import { useMutation } from "@apollo/client"
import { useState } from "react"
import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries"

const Authors = ({ authors }) => {
  /* const authors = [] */

  // Has to refetch since manually adding the ID to the parameters to update the cache breaks the app, probably due to not passing the ID or bookCount

  const [ editAuthorYear ] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [ {query: ALL_AUTHORS} ]
  })

  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  const submit = (event) => {
    event.preventDefault()

    editAuthorYear({variables: {name, born} })

    setName('')
    setBorn('')
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      

      <form onSubmit={submit}>

        <h3>Set birth year</h3>

        <div>
          name
          <input
            value={name}
            onChange={({ target }) => setName(target.value)}
          />
        </div>
        <div>
          born
          <input
            type="number"
            value={born}
            onChange={({ target }) => setBorn(Number(target.value))}
          />
        </div>
        <button type="submit">update author</button>


      </form>
    </div>
  )
}

export default Authors
