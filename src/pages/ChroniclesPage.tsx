import { type FC, useEffect } from 'react'
import { Container, Row, Col, Form, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ChronicleCard from '../components/ChronicleCard'
import Breadcrumbs from '../components/Breadcrumbs'
import ResearchCartButton from '../components/ResearchCartButton'
import { ROUTES, ROUTE_LABELS } from '../Routes'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { setSearchValue, setSelectedLocation, getChroniclesList } from '../store/chroniclesSlice'
import { getDraftRequestInfo, addChronicleToRequest } from '../store/draftRequestSlice'
import './ChroniclesPage.css'

const ChroniclesPage: FC = () => {
  /**
   * REDUX: Чтение данных из store с помощью useAppSelector
   * 
   * useAppSelector - это хук, который подписывает компонент на изменения в Redux store.
   * Когда выбранная часть state изменяется, компонент автоматически перерендерится.
   * 
   * Селектор функция (state) => state.chronicles.searchValue:
   * - Получает весь state
   * - Возвращает нужную часть (state.chronicles.searchValue)
   * - Компонент получает только это значение
   */
  // Читаем данные из Redux store для летописей
  const searchValue = useAppSelector((state) => state.chronicles.searchValue)
  const selectedLocation = useAppSelector((state) => state.chronicles.selectedLocation)
  const chronicles = useAppSelector((state) => state.chronicles.chronicles)
  const loading = useAppSelector((state) => state.chronicles.loading)
  
  // Читаем данные из Redux store для корзины (черновика заявки)
  const { count: cartCount, request_id } = useAppSelector((state) => state.draftRequest)
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  
  // Отладочный вывод
  useEffect(() => {
    console.log('ChroniclesPage - cartCount:', cartCount, 'request_id:', request_id, 'isAuthenticated:', isAuthenticated)
  }, [cartCount, request_id, isAuthenticated])
  
  /**
   * REDUX: Получение функции dispatch для отправки actions
   * 
   * dispatch используется для:
   * 1. Отправки синхронных actions (изменение состояния напрямую)
   * 2. Отправки асинхронных thunks (API запросы через Axios)
   */
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  /**
   * REDUX + AXIOS: Загрузка данных при монтировании компонента
   * 
   * useEffect вызывается после первого рендера компонента.
   * dispatch(getChroniclesList()) - отправляет async thunk, который:
   * 1. Устанавливает loading: true в Redux state
   * 2. Выполняет Axios GET запрос на /api/chronicle_resources
   * 3. При успехе - сохраняет данные в Redux state (chronicles: [...])
   * 4. При ошибке - сохраняет ошибку в Redux state (error: "...")
   * 5. Устанавливает loading: false
   * 
   * Компонент автоматически перерендерится, когда данные загрузятся,
   * так как он подписан на state.chronicles через useAppSelector.
   */
  useEffect(() => {
    // Отправляем async thunk для загрузки списка летописей
    // Внутри getChroniclesList выполняется Axios запрос через api.api.chronicleResourcesList()
    dispatch(getChroniclesList())
    
    // Загружаем корзину, если пользователь авторизован
    // getDraftRequestInfo() - async thunk, который делает Axios GET запрос
    if (isAuthenticated && (!request_id || request_id === 0)) {
      dispatch(getDraftRequestInfo())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  /**
   * Обработчик поиска - пример отправки action при действии пользователя
   * 
   * При отправке формы:
   * 1. dispatch(getChroniclesList()) - отправляет async thunk
   * 2. Thunk выполняет Axios запрос с текущими фильтрами (searchValue, selectedLocation)
   * 3. Результат сохраняется в Redux state
   * 4. Компонент перерендеривается с новыми данными
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(getChroniclesList())
  }

  // Извлекаем уникальные города из загруженных летописей
  const uniqueLocations = Array.from(
    new Set(chronicles.map(c => c.location).filter((loc): loc is string => !!loc))
  ).sort()

  // Обработчик клика на карточку - переход на страницу детального просмотра
  const handleCardClick = (id: number) => {
    navigate(`/chronicle/${id}`)
  }

  // Обработчик клика на корзину
  const handleCartClick = () => {
    // Если корзина пустая, переходим на страницу черновика
    if (!request_id || request_id === 0 || cartCount === 0) {
      navigate(ROUTES.DRAFT)
    } else {
      navigate(`/request/${request_id}`)
    }
  }

  // Обработчик добавления хроники в заявку
  const handleAddToRequest = async (chronicleId: number) => {
    await dispatch(addChronicleToRequest(chronicleId))
    // getDraftRequestInfo уже вызывается внутри addChronicleToRequest
  }

  return (
    <>
      <Header />
      <ResearchCartButton 
        count={cartCount} 
        onClick={handleCartClick}
        disabled={!isAuthenticated}
      />
      <div className={`chronicles-container ${loading ? 'loading' : ''}`}>
        {loading && (
          <div className="loading-overlay">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Загрузка...</span>
            </div>
          </div>
        )}
        
        {/* В crumbs указываем только label, так как путь нам не важен, последняя крошка не активна */}
        <Breadcrumbs crumbs={[{ label: ROUTE_LABELS.CHRONICLES }]} />
        
        <h1 className="chronicles-title">Лéтописи исследование</h1>
        
        <Container>
          <Form className="search-form" onSubmit={handleSearch}>
            <Form.Control
              type="text"
              placeholder="Поиск по названию..."
              value={searchValue}
              onChange={(e) => dispatch(setSearchValue(e.target.value))}
              className="search-input"
            />
            <Form.Select
              value={selectedLocation}
              onChange={(e) => dispatch(setSelectedLocation(e.target.value))}
              className="location-filter"
            >
              <option value="">Все города</option>
              {uniqueLocations.map((location, index) => (
                <option key={index} value={location}>
                  {location}
                </option>
              ))}
            </Form.Select>
            <Button 
              type="submit" 
              className="search-button"
              disabled={loading}
            >
              Найти
            </Button>
          </Form>

          {!loading && !chronicles.length ? (
            <div className="no-results">
              <h3>К сожалению, пока ничего не найдено 😔</h3>
            </div>
          ) : (
            <Row className="chronicles-grid">
              {chronicles.map((chronicle, index) => (
                <Col key={chronicle.id || index} xs={12} md={6} lg={4}>
                  <ChronicleCard 
                    chronicle={chronicle}
                    imageClickHandler={() => chronicle.id && handleCardClick(chronicle.id)}
                    onAddToRequest={chronicle.id ? () => handleAddToRequest(chronicle.id!) : undefined}
                    showAddButton={isAuthenticated}
                  />
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </div>
      <Footer />
    </>
  )
}

export default ChroniclesPage

