import { type FC, useState, useEffect } from 'react'
import { Container, Row, Col, Form, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ChronicleCard from '../components/ChronicleCard'
import Breadcrumbs from '../components/Breadcrumbs'
import ResearchCartButton from '../components/ResearchCartButton'
import { getChronicles, getChronicleResearchDraft, type ChronicleResource } from '../modules/chronicleApi'
import { ROUTE_LABELS } from '../Routes'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { setSearchQuery, setSelectedLocation } from '../store/filtersSlice'
import './ChroniclesPage.css'

const ChroniclesPage: FC = () => {
  // Redux state для фильтров
  const searchValue = useAppSelector((state) => state.filters.searchQuery)
  const selectedLocation = useAppSelector((state) => state.filters.selectedLocation)
  const dispatch = useAppDispatch()
  
  // Локальный state для данных и загрузки
  const [loading, setLoading] = useState(false)
  const [chronicles, setChronicles] = useState<ChronicleResource[]>([])
  const [cartCount, setCartCount] = useState(0)
  const navigate = useNavigate()

  // Загрузка летописей при монтировании компонента (с сохраненными фильтрами)
  useEffect(() => {
    loadChronicles(searchValue, selectedLocation)
    // Корзину загружаем только при клике, не при загрузке страницы
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Загрузка информации о корзине
  const loadCartInfo = () => {
    getChronicleResearchDraft()
      .then((data) => {
        setCartCount(data.count)
      })
      .catch(() => {
        setCartCount(0)
      })
  }

  const loadChronicles = (query: string = '', location: string = '') => {
    setLoading(true)
    getChronicles(query, location)
      .then((response) => {
        setChronicles(response.chronicleResources)
        setLoading(false)
      })
      .catch(() => {
        // В случае ошибки mock-данные уже вернутся из API функции
        setLoading(false)
      })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadChronicles(searchValue, selectedLocation)
  }

  // Извлекаем уникальные города из загруженных летописей
  const uniqueLocations = Array.from(new Set(chronicles.map(c => c.location))).sort()

  // Обработчик клика на карточку - переход на страницу детального просмотра
  const handleCardClick = (id: number) => {
    navigate(`/chronicle/${id}`)
  }

  // Обработчик клика на корзину
  const handleCartClick = () => {
    console.log('Cart clicked - sending GET request to /api/ChronicleRequestList/chronicle_draft')
    loadCartInfo() // Перезагружаем информацию о корзине
  }

  return (
    <>
      <Header />
      <ResearchCartButton count={cartCount} onClick={handleCartClick} />
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
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
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
                <Col key={index} xs={12} md={6} lg={4}>
                  <ChronicleCard 
                    chronicle={chronicle}
                    imageClickHandler={() => handleCardClick(chronicle.id)}
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

