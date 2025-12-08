import { type FC, useEffect, useState } from 'react'
import { Container, Table, Spinner, Alert, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Breadcrumbs from '../components/Breadcrumbs'
import { ROUTES, ROUTE_LABELS } from '../Routes'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { getRequestsList, getDraftRequestInfo } from '../store/draftRequestSlice'
import './RequestsListPage.css'

const RequestsListPage: FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const userRole = useAppSelector((state) => state.auth.role)
  const isModerator = userRole === 1
  
  const { requestsList, requestsListLoading, requestsListError, request_id } = useAppSelector((state) => state.draftRequest)
  const [draftRequestId, setDraftRequestId] = useState<number | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getRequestsList())
      // Загружаем информацию о черновике для кнопки
      dispatch(getDraftRequestInfo()).then((result) => {
        if (result.type === 'draftRequest/getDraftRequestInfo/fulfilled') {
          const payload = result.payload as any
          if (payload?.request_id && payload.request_id > 0) {
            setDraftRequestId(payload.request_id)
          } else {
            setDraftRequestId(null)
          }
        }
      })
    }
  }, [isAuthenticated, dispatch])

  const getStatusLabel = (status: number | string | undefined): string => {
    if (typeof status === 'number') {
      switch (status) {
        case 1: return 'Черновик'
        case 2: return 'Сформирован'
        case 3: return 'Завершён'
        case 4: return 'Отклонён'
        case 5: return 'Удалён'
        default: return 'Неизвестно'
      }
    }
    if (typeof status === 'string') {
      switch (status) {
        case 'черновик': return 'Черновик'
        case 'сформирован': return 'Сформирован'
        case 'завершён': return 'Завершён'
        case 'отклонён': return 'Отклонён'
        case 'удалён': return 'Удалён'
        default: return status
      }
    }
    return 'Неизвестно'
  }

  const getStatusClass = (status: number | string | undefined): string => {
    if (typeof status === 'number') {
      switch (status) {
        case 1: return 'status-draft'
        case 2: return 'status-formed'
        case 3: return 'status-completed'
        case 4: return 'status-rejected'
        case 5: return 'status-deleted'
        default: return ''
      }
    }
    if (typeof status === 'string') {
      switch (status) {
        case 'черновик': return 'status-draft'
        case 'сформирован': return 'status-formed'
        case 'завершён': return 'status-completed'
        case 'отклонён': return 'status-rejected'
        case 'удалён': return 'status-deleted'
        default: return ''
      }
    }
    return ''
  }

  const handleRowClick = (requestId: number | undefined) => {
    if (requestId) {
      navigate(`${ROUTES.REQUEST}/${requestId}`)
    }
  }

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <Container className="mt-5">
          <Alert variant="warning">Необходимо войти в систему для просмотра заявок</Alert>
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
          { label: 'Список заявок' },
        ]}
      />
      <Container className="requests-list-container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="requests-list-title mb-0">Список заявок</h1>
          {/* Кнопка "Перейти к черновику" только для исследователей (не модераторов) */}
          {!isModerator && (
            <Button
              variant={draftRequestId ? "danger" : "secondary"}
              onClick={() => {
                if (draftRequestId) {
                  navigate(`${ROUTES.REQUEST}/${draftRequestId}`)
                }
              }}
              disabled={!draftRequestId}
              className="draft-button"
            >
              {draftRequestId ? 'Перейти к черновику' : 'Черновик отсутствует'}
            </Button>
          )}
        </div>

        {requestsListLoading && (
          <div className="text-center my-5">
            <Spinner animation="border" variant="danger" />
          </div>
        )}

        {requestsListError && (
          <Alert variant="danger" dismissible>
            {requestsListError}
          </Alert>
        )}

        {!requestsListLoading && !requestsListError && (
          <>
            {requestsList.length === 0 ? (
              <Alert variant="info">У вас пока нет заявок</Alert>
            ) : (
              <Table striped bordered hover className="requests-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Название</th>
                    <th>Описание</th>
                    <th>Статус</th>
                    <th>Дата создания</th>
                    <th>Дата формирования</th>
                  </tr>
                </thead>
                <tbody>
                  {requestsList.map((request: any) => (
                    <tr
                      key={request.id || request.request_id}
                      onClick={() => handleRowClick(request.id || request.request_id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>{request.id || request.request_id}</td>
                      <td>{request.name || request.research_title || 'Без названия'}</td>
                      <td>{request.search_event || request.research_description || 'Нет описания'}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(request.status)}`}>
                          {getStatusLabel(request.status)}
                        </span>
                      </td>
                      <td>
                        {request.created_at 
                          ? (() => {
                              let dateValue = request.created_at;
                              if (typeof dateValue === 'object' && dateValue !== null) {
                                dateValue = (dateValue as any).Time || (dateValue as any).Valid ? (dateValue as any).Time : null;
                              }
                              if (dateValue) {
                                try {
                                  const date = new Date(dateValue);
                                  if (!isNaN(date.getTime())) {
                                    return date.toLocaleDateString('ru-RU');
                                  }
                                } catch (e) {
                                  console.error('Date parsing error:', e, dateValue);
                                }
                              }
                              return 'Не указана';
                            })()
                          : 'Не указана'}
                      </td>
                      <td>
                        {request.formed_at 
                          ? (() => {
                              // Обрабатываем SqlNullTime структуру
                              const formedAt = request.formed_at as any;
                              if (formedAt && typeof formedAt === 'object') {
                                // Проверяем valid и используем time
                                if (formedAt.valid && formedAt.time) {
                                  try {
                                    const date = new Date(formedAt.time);
                                    if (!isNaN(date.getTime())) {
                                      return date.toLocaleDateString('ru-RU');
                                    }
                                  } catch (e) {
                                    console.error('Date parsing error:', e, formedAt.time);
                                  }
                                }
                              } else if (typeof formedAt === 'string') {
                                // Если это строка напрямую
                                try {
                                  const date = new Date(formedAt);
                                  if (!isNaN(date.getTime())) {
                                    return date.toLocaleDateString('ru-RU');
                                  }
                                } catch (e) {
                                  console.error('Date parsing error:', e, formedAt);
                                }
                              }
                              return '-';
                            })()
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </>
        )}
      </Container>
      <Footer />
    </>
  )
}

export default RequestsListPage

