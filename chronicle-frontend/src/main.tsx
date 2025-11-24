import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store'
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
  basename: import.meta.env.BASE_URL
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
)
