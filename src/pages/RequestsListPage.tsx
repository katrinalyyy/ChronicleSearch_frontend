import { type FC, useEffect, useState } from 'react'
import { Container, Table, Spinner, Alert, Button, Form, Row, Col } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Breadcrumbs from '../components/Breadcrumbs'
import { ROUTES, ROUTE_LABELS } from '../Routes'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { getRequestsList } from '../store/draftRequestSlice'
import './RequestsListPage.css'

const RequestsListPage: FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  
  const { requestsList, requestsListLoading, requestsListError } = useAppSelector((state) => state.draftRequest)
  
  // Состояние фильтров
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [status, setStatus] = useState<string>('')

  useEffect(() => {
    if (isAuthenticated) {
      // Загружаем заявки без фильтров при первой загрузке
      dispatch(getRequestsList())
    }
  }, [isAuthenticated, dispatch])

  // Обработчик применения фильтров
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const filters: { status?: string; start_date?: string; end_date?: string } = {}
    if (status) filters.status = status
    if (startDate) filters.start_date = startDate
    if (endDate) filters.end_date = endDate
    dispatch(getRequestsList(Object.keys(filters).length > 0 ? filters : undefined))
  }

  // Обработчик сброса фильтров
  const handleFilterReset = () => {
    setStartDate('')
    setEndDate('')
    setStatus('')
    dispatch(getRequestsList())
  }

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

        {/* Форма фильтрации */}
        <Form onSubmit={handleFilterSubmit} className="mb-4">
          <Row className="g-3 align-items-end">
            <Col md={3}>
              <Form.Label>Дата начала</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Label>Дата окончания</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
              />
            </Col>
            <Col md={3}>
              <Form.Label>Статус</Form.Label>
              <Form.Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Все статусы</option>
                <option value="черновик">Черновик</option>
                <option value="сформирован">Сформирован</option>
                <option value="завершён">Завершён</option>
                <option value="отклонён">Отклонён</option>
                <option value="удалён">Удалён</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <div className="d-flex gap-2">
                <Button variant="danger" type="submit" disabled={requestsListLoading}>
                  Применить
                </Button>
                <Button variant="outline-secondary" type="button" onClick={handleFilterReset}>
                  Сбросить
                </Button>
              </div>
            </Col>
          </Row>
        </Form>

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
                        {(() => {
                          const formedAt = request.formed_at;
                          if (!formedAt) {
                            return '-';
                          }
                          
                          // Обрабатываем SqlNullTime структуру
                          if (typeof formedAt === 'object' && formedAt !== null) {
                            // Проверяем разные варианты структуры (Valid/Time или valid/time)
                            const isValid = (formedAt as any).Valid !== undefined 
                              ? (formedAt as any).Valid 
                              : (formedAt as any).valid;
                            const timeValue = (formedAt as any).Time || (formedAt as any).time;
                            
                            if (isValid && timeValue) {
                              try {
                                const date = new Date(timeValue);
                                if (!isNaN(date.getTime())) {
                                  return date.toLocaleDateString('ru-RU');
                                }
                              } catch (e) {
                                console.error('Date parsing error:', e, timeValue, 'formedAt:', formedAt);
                              }
                            } else {
                              // Логируем для отладки, если valid=false или time отсутствует
                              console.log('formed_at structure:', formedAt, 'isValid:', isValid, 'timeValue:', timeValue);
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
                        })()}
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

