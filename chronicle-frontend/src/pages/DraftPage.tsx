import { type FC, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Alert, Spinner } from 'react-bootstrap'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Breadcrumbs from '../components/Breadcrumbs'
import { ROUTES, ROUTE_LABELS } from '../Routes'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { getDraftRequestInfo } from '../store/draftRequestSlice'

const DraftPage: FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const userRole = useAppSelector((state) => state.auth.role)
  const isModerator = userRole === 1
  const { request_id, loading } = useAppSelector((state) => state.draftRequest)

  useEffect(() => {
    if (isAuthenticated && !isModerator) {
      // Загружаем информацию о черновике
      dispatch(getDraftRequestInfo())
    }
  }, [isAuthenticated, isModerator, dispatch])

  useEffect(() => {
    // Если черновик найден, перенаправляем на страницу заявки
    if (request_id && request_id > 0) {
      navigate(`${ROUTES.REQUEST}/${request_id}`)
    }
  }, [request_id, navigate])

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <Container className="mt-5">
          <Alert variant="warning">Необходимо войти в систему для просмотра черновика</Alert>
        </Container>
        <Footer />
      </>
    )
  }

  if (isModerator) {
    return (
      <>
        <Header />
        <Breadcrumbs
          crumbs={[
            { label: ROUTE_LABELS.CHRONICLES, path: ROUTES.CHRONICLES },
            { label: 'Черновик' },
          ]}
        />
        <Container className="mt-5">
          <Alert variant="info">Черновик доступен только для исследователей</Alert>
        </Container>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <Breadcrumbs
        crumbs={[
          { label: ROUTE_LABELS.CHRONICLES, path: ROUTES.CHRONICLES },
          { label: 'Черновик' },
        ]}
      />
      <Container className="mt-5">
        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="danger" />
          </div>
        ) : (
          <Alert variant="info">
            Черновик отсутствует. Начните создавать новую заявку, добавив летописи в корзину.
          </Alert>
        )}
      </Container>
      <Footer />
    </>
  )
}

export default DraftPage

