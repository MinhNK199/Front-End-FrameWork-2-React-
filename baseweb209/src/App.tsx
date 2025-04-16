
import { useRoutes } from 'react-router-dom'
import ClientLayout from './layout/client'
import AdminLayout from './layout/admin'
import Home from './components/client/home'
import StudentList from './components/client/studentList'
import AddStudent from './components/client/addStudent'
import EditStudent from './components/client/editStudent'
type Props = {}

const App = (props: Props) => {
  const routes = useRoutes([
    {
      path: "/", element: <ClientLayout />, children: [
        { path: "", element: <Home /> },
        { path: "/student", element: < StudentList /> },
        { path: "/student/add", element: < AddStudent /> },
        { path: "/student/edit/:id", element: < EditStudent /> }
      ]
    },
    { path: "/dashboard", element: <AdminLayout />, children: [] },
  ])
  return routes
}

export default App