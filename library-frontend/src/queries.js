import { gql } from "@apollo/client";

export const ALL_AUTHORS = gql`
query {
    allAuthors {
        name
        born
        bookCount
    }
}
`

export const ALL_BOOKS = gql`
query {
    allBooks {
        title
        published
        author {
            name
        }
    }
}
`

export const ADD_BOOK = gql`
mutation createNewBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) 
{
    addBook(
        title: $title,
        author: $author,
        published: $published,
        genres: $genres
    ) {
        title
        published
        genres
        author {
            name
        }
    } 
}
`

export const EDIT_AUTHOR = gql`
mutation editAuthorYear($name: String!, $born: Int!) {
    editAuthor(name: $name, setBornTo: $born) 
    {
        name
        born
        id
    }
}
`

export const LOGIN = gql`
    mutation login($username: String!, $password: String!){
        login(username: $username, password: $password) {
            value
        }
    }
`