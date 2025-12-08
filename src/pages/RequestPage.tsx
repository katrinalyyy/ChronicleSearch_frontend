import { type FC, useEffect, type ChangeEvent } from 'react'
import { Alert, Button } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Breadcrumbs from '../components/Breadcrumbs'
import { ROUTES, ROUTE_LABELS } from '../Routes'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { getRequestDetail, deleteRequest, updateRequest, formRequest, deleteChronicleFromRequest, updateChronicleQuote, setRequestData, setError, updateChronicleQuoteLocal, moderateRequest } from '../store/draftRequestSlice'
import { setRole } from '../store/authSlice'
import { defaultImage } from '../constants/defaultImage'
import { api } from '../api'
import './RequestPage.css'

const RequestPage: FC = () => {
  const { requestId } = useParams<{ requestId: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const {
    chronicles,
    requestData,
    error,
    loading,
    isDraft,
    request_id,
    requestStatus,
  } = useAppSelector((state) => state.draftRequest)

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const userRole = useAppSelector((state) => state.auth.role)
  const isModerator = userRole === 1

  // Проверяем, является ли заявка сформированной (для отображения кнопок модератора)
  const isFormed = requestStatus === 2 || requestStatus === 'сформирован' || requestStatus === 'RequestStatusFormed'
  
  console.log('RequestPage render - isModerator:', isModerator, 'userRole:', userRole, 'isFormed:', isFormed, 'requestStatus:', requestStatus, 'isDraft:', isDraft)

  useEffect(() => {
    if (requestId) {
      dispatch(getRequestDetail(Number(requestId)))
    }
  }, [dispatch, requestId])

  // Загружаем роль пользователя, если она не загружена
  useEffect(() => {
    if (isAuthenticated && userRole === null) {
      // Роль должна загружаться при логине, но на всякий случай загружаем здесь
      api.api.userProfileList().then((response) => {
        console.log('RequestPage - userProfileList full response:', response)
        console.log('RequestPage - userProfileList response.data:', response.data)
        console.log('RequestPage - userProfileList response.data.data:', response.data?.data)
        // Проверяем разные возможные структуры ответа
        const role = response.data?.role ?? response.data?.data?.role
        if (role !== undefined && role !== null) {
          dispatch(setRole(role))
          console.log('RequestPage - Role updated to:', role)
        } else {
          console.warn('RequestPage - Role not found in response:', response.data)
        }
      }).catch((error) => {
        console.error('RequestPage - Failed to load user profile:', error)
      })
    }
  }, [isAuthenticated, userRole, dispatch])

  // Отладочный вывод для проверки условий отображения кнопок модератора
  useEffect(() => {
    console.log('RequestPage - Debug info:', {
      isModerator,
      userRole,
      isDraft,
      isFormed,
      requestStatus,
      isAuthenticated,
      request_id,
      shouldShowModeratorButtons: isModerator && isFormed,
      condition1: isModerator,
      condition2: isFormed,
      condition3: requestStatus === 'сформирован',
      condition4: requestStatus === 2,
    })
  }, [isModerator, userRole, isDraft, isFormed, requestStatus, isAuthenticated, request_id])

  const handleCardClick = (id: number | undefined) => {
    if (id) {
      navigate(`${ROUTES.CHRONICLE_DETAIL}/${id}`)
    }
  }

  // Обработчик удаления заявки
  const handleDeleteRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (request_id) {
      try {
        await dispatch(deleteRequest(request_id)).unwrap()
        navigate(ROUTES.CHRONICLES)
      } catch (error) {
        dispatch(setError(String(error)))
      }
    }
  }

  // Обработчик изменения полей заявки
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    dispatch(setRequestData({
      ...requestData,
      [name]: value,
    }))
  }

  // Обработчик сохранения заявки (формирование заявки из черновика)
  const handleSaveRequest = async () => {
    if (request_id) {
      try {
        // Проверяем, что заявка является черновиком
        if (!isDraft) {
          dispatch(setError('Заявка уже сформирована и не может быть изменена'))
          return
        }
        
        // Проверяем, что есть хотя бы одна хроника в заявке
        if (chronicles.length === 0) {
          dispatch(setError('Нельзя сформировать заявку без хроник. Добавьте хотя бы одну хронику.'))
          return
        }
        
        // Проверяем, что заполнены обязательные поля
        if (!requestData.research_title || !requestData.research_title.trim()) {
          dispatch(setError('Необходимо заполнить поле "Название события"'))
          return
        }
        
        if (!requestData.research_description || !requestData.research_description.trim()) {
          dispatch(setError('Необходимо заполнить поле "Общий текст исследования"'))
          return
        }
        
        console.log('Forming request:', { request_id, isDraft, chroniclesCount: chronicles.length })
        
        // Сначала обновляем поля заявки
        await dispatch(updateRequest({ requestId: request_id, requestData })).unwrap()
        console.log('Request updated successfully')
        
        // Затем формируем заявку (завершаем черновик)
        await dispatch(formRequest(request_id)).unwrap()
        console.log('Request formed successfully')
        
        // Перезагружаем данные заявки
        await dispatch(getRequestDetail(request_id))
      } catch (error: any) {
        const errorMessage = error?.message || String(error) || 'Ошибка при сохранении заявки'
        console.error('handleSaveRequest error:', error)
        console.error('handleSaveRequest error response:', error?.response?.data)
        dispatch(setError(errorMessage))
      }
    }
  }

  // Обработчик удаления хроники из заявки
  const handleDeleteChronicle = async (chronicleId: number) => {
    if (request_id) {
      try {
        await dispatch(deleteChronicleFromRequest({ requestId: request_id, chronicleId })).unwrap()
        // Обновляем данные заявки
        await dispatch(getRequestDetail(request_id))
      } catch (error) {
        dispatch(setError(String(error)))
      }
    }
  }

  // Обработчики действий модератора
  const handleModerateRequest = async (action: 'complete' | 'reject') => {
    if (request_id) {
      try {
        await dispatch(moderateRequest({ requestId: request_id, action })).unwrap()
        // Перезагружаем данные заявки после модерации
        await dispatch(getRequestDetail(request_id))
      } catch (error) {
        dispatch(setError(String(error)))
      }
    }
  }

  // Обработчик изменения цитаты
  const handleQuoteChange = async (chronicleId: number, quote: string) => {
    if (request_id && isAuthenticated) {
      // Обновляем локально сразу для быстрого отклика
      dispatch(updateChronicleQuoteLocal({ chronicleId, quote }))
      // Сохраняем на сервере
      try {
        await dispatch(updateChronicleQuote({ requestId: request_id, chronicleId, quote })).unwrap()
      } catch (error) {
        dispatch(setError(String(error)))
      }
    }
  }

  // Функция для проверки, содержится ли цитата в общем тексте
  const isQuoteMatched = (quote: string | undefined): boolean => {
    if (!quote || !requestData.research_description) {
      return false
    }
    const generalText = requestData.research_description.toLowerCase()
    const quoteText = quote.toLowerCase().trim()
    return quoteText.length > 0 && generalText.includes(quoteText)
  }

  return (
    <>
      <Header />
      <Breadcrumbs
        crumbs={[
          { label: ROUTE_LABELS.CHRONICLES, path: ROUTES.CHRONICLES },
          { label: 'Заявка на исследование' },
        ]}
      />
      <main className="research-container">
        {loading && (
          <div className="loading-overlay">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Загрузка...</span>
            </div>
          </div>
        )}
        
        {error && (
          <Alert variant="danger" dismissible onClose={() => dispatch(setError(null))}>
            {error}
          </Alert>
        )}

        <h1>ЛÉТОПИСИ ИССЛЕДОВАНИЕ</h1>
        
        <div className="search-section">
          <div className="search-container">
            <input 
              type="text" 
              name="research_description"
              value={requestData.research_description || ''} 
              onChange={handleInputChange}
              placeholder="Общий текст исследования"
              className="search-input"
              disabled={!isAuthenticated}
            />
          </div>
          <div className="name-event">
            <input 
              type="text" 
              name="research_title"
              value={requestData.research_title || ''} 
              onChange={handleInputChange}
              placeholder="Название события"
              className="name-event-input"
              disabled={!isAuthenticated}
            />
          </div>
        </div>

               <div style={{ textAlign: 'center', marginBottom: '30px', minHeight: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                 {/* Кнопки редактирования для всех авторизованных пользователей (включая модераторов) */}
                 {isDraft && isAuthenticated && (
                   <>
                     <Button 
                       variant="danger" 
                       className="save-button" 
                       onClick={handleSaveRequest}
                     >
                       Сохранить
                     </Button>
                     <Button 
                       variant="danger" 
                       className="save-button" 
                       onClick={handleDeleteRequest}
                     >
                       Очистить
                     </Button>
                     <button 
                       type="button"
                       className="delete-request" 
                       onClick={handleDeleteRequest}
                     >
                       Удалить заявку
                     </button>
                   </>
                 )}
                 {/* Кнопки модератора для сформированных заявок */}
                 {isModerator && !isDraft && requestStatus && (requestStatus === 'сформирован' || requestStatus === 2 || requestStatus === 'RequestStatusFormed') && (
                   <>
                     <Button 
                       variant="success" 
                       className="save-button" 
                       onClick={() => handleModerateRequest('complete')}
                       disabled={loading}
                     >
                       Подтвердить заявку
                     </Button>
                     <Button 
                       variant="danger" 
                       className="save-button" 
                       onClick={() => handleModerateRequest('reject')}
                       disabled={loading}
                     >
                       Отклонить заявку
                     </Button>
                   </>
                 )}
               </div>

        <div className="table-header">
          <div className="col-title">Название документа</div>
          <div className="col-author">Автор(ы)</div>
          <div className="col-date">Дата создания</div>
          <div className="col-time">Время действия</div>
          <div className="col-place">Место</div>
          <div className="col-availability">Наличие</div>
          <div className="col-status"></div>
        </div>
        
        <div className="chronicles-list">
          {!loading && !chronicles.length ? (
            <div className="no-results">
              <h3>К сожалению, пока ничего не найдено 😔</h3>
            </div>
          ) : (
            chronicles.map((item, index) => {
              const chronicle = item.chronicle;
              if (!chronicle) return null;
              
              return (
                <div key={chronicle.id || index} className="chronicle-row">
                  <div className="chronicle-info">
                    <img 
                      src={chronicle.image || defaultImage} 
                      alt={chronicle.title || 'Хроника'} 
                      className="chronicle-image"
                      onClick={() => handleCardClick(chronicle.id)}
                      onError={(e) => {
                        e.currentTarget.src = defaultImage;
                      }}
                    />
                    <div className="chronicle-details">
                      <h3>{chronicle.title || 'Без названия'}</h3>
                    </div>
                  </div>
                  <div className="col-author">{chronicle.author || 'Неизвестен'}</div>
                  <div className="col-date">{chronicle.date_of_creation || 'Не указана'}</div>
                  <div className="col-time">{chronicle.time_of_action || 'Не указано'}</div>
                  <div className="col-place">{chronicle.location || 'Не указано'}</div>
                  <div className="col-availability">
                    <input 
                      type="text" 
                      placeholder="Цитата" 
                      className="availability-input"
                      value={item.quote || ''}
                      onChange={(e) => {
                        const quote = e.target.value
                        dispatch(updateChronicleQuoteLocal({ chronicleId: chronicle.id!, quote }))
                      }}
                      onBlur={(e) => {
                        if (chronicle.id && request_id) {
                          handleQuoteChange(chronicle.id, e.target.value)
                        }
                      }}
                      disabled={!isAuthenticated}
                    />
                  </div>
                  <div className="col-status">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                      <div className={`status-indicator ${isQuoteMatched(item.quote) ? 'matched' : 'not-matched'}`}>
                        <span className="status-icon">{isQuoteMatched(item.quote) ? '✓' : '✗'}</span>
                      </div>
                      {chronicle.id && isAuthenticated && (
                        <button 
                          className="delete-chronicle-btn"
                          onClick={() => handleDeleteChronicle(chronicle.id!)}
                          title="Удалить из заявки"
                        >
                          Удалить
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export default RequestPage

