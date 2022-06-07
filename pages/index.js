import styles from '../styles/Home.module.css'
import {useState} from 'react'
import { ApolloClient, InMemoryCache, createHttpLink, gql,} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const authLink = setContext((_, { headers }) => {
  return {
  headers: {
       ...headers, 'x-hasura-admin-secret': 'SBZSXmQup1sazVFWfZj96pN88m6xXy801WsVjraNZVhk0hHL2JaHHmkwD2lSbAvZ'
     }
   }
 });
 
 const httpLink = createHttpLink({
  uri: 'https://obliging-gazelle-74.hasura.app/v1/graphql',
 });

 const client = new ApolloClient({
  link:authLink.concat(httpLink),
  cache: new InMemoryCache()
});



export default function Home(todos) {
  const [userInput, setUserInput]=useState('')
  const [todoList, setTodoList]=useState([])

  for (var i =0; i<todos.todos.length;i++){
    todoList[i]=todos.todos[i].text
  }
  console.log(todos.todos);

  const handleChange=(e)=>{
    e.preventDefault()
    setUserInput(e.target.value)
  }

  const handleSubmit = (e)=>{
    e.preventDefault()

    setTodoList([
      userInput,
      ...todoList
    ]);

    client.mutate({
      mutation: gql`
        mutation addTodo {
          insert_todos(objects: {done: false, text: userInput}) {
            affected_rows
          }
        }
      `
    });

    setUserInput('')
  }

  const handleDelete = (todo) =>{
    const updatedArr = todoList.filter(todoItem => todoList.indexOf(todoItem) != todoList.indexOf(todo))

    client.mutate({
      mutation: gql`
        mutation delTodo {
          delete_todos(where: {text: {_eq: todo}}) {
            affected_rows
          }
        }
      `
    });

    setTodoList(updatedArr)
  }

  return (
    <div>
      <h3>Next JS Todo List</h3>
      <form>
        <input type="text" value={userInput} placeholder="Enter a todo item" onChange={handleChange}/>
        <button onClick={handleSubmit}>Submit</button>
      </form>
      <ul>
        {
          todoList.length >=1 ?todoList.map((todo,idx)=>{
            return<li key={idx}>{todo}<button onClick={(e) => {
              e.preventDefault()
              handleDelete(todo)}}>Delete</button></li>
          })
          : "Enter a todo item"
        }
      </ul>
    </div>
  )
}




export async function getStaticProps() {
  const client = new ApolloClient({
    link:authLink.concat(httpLink),
    cache: new InMemoryCache()
  });

  const { data } = await client.query({
    query: gql`
      query getTodo {
        todos {
          text
        }
      }
    `
  });

  // await client.mutate({
  //   mutation: gql`
  //     mutation addTodo {
  //       insert_todos(objects: {done: false, text: "eat"}) {
  //         affected_rows
  //       }
  //     }
  //   `
  // });

  // await client.mutate({
  //   mutation: gql`
  //     mutation delTodo {
  //       delete_todos(where: {text: {_eq: "study"}}) {
  //         affected_rows
  //       }
  //     }
  //   `
  // });

  return{
    props:{
      todos: data.todos
    }
  }
}