import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'

// Импортируем страницы
import HomePage from './pages/HomePage'
import ChroniclesPage from './pages/ChroniclesPage'
import ChronicleDetailPage from './pages/ChronicleDetailPage'
import LoginPage from './pages/LoginPage'
import RequestPage from './pages/RequestPage'
import RequestsListPage from './pages/RequestsListPage'
import UserProfilePage from './pages/UserProfilePage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/chronicles',
    element: <ChroniclesPage />,
  },
  {
    path: '/chronicle/:id',
    element: <ChronicleDetailPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/request/:requestId',
    element: <RequestPage />,
  },
  {
    path: '/requests',
    element: <RequestsListPage />,
  },
  {
    path: '/profile',
    element: <UserProfilePage />,
  },
], {
  basename: import.meta.env.BASE_URL
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
)
