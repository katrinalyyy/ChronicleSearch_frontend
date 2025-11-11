import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'

// Импортируем страницы (пока заглушки, создадим далее)
import HomePage from './pages/HomePage'
import ChroniclesPage from './pages/ChroniclesPage'
import ChronicleDetailPage from './pages/ChronicleDetailPage'

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
], {
  basename: '/ChronicleSearch_frontend'
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
