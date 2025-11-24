import { type FC, useState, useEffect } from 'react'
import { Container, Row, Col, Form, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ChronicleCard from '../components/ChronicleCard'
import Breadcrumbs from '../components/Breadcrumbs'
import ResearchCartButton from '../components/ResearchCartButton'
import { getChronicleResearchDraft } from '../modules/chronicleApi'
import { ROUTE_LABELS } from '../Routes'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { setSearchValue, setSelectedLocation, getChroniclesList } from '../store/chroniclesSlice'
import './ChroniclesPage.css'

const ChroniclesPage: FC = () => {
  // Redux state для хроник
  const searchValue = useAppSelector((state) => state.chronicles.searchValue)
  const selectedLocation = useAppSelector((state) => state.chronicles.selectedLocation)
  const chronicles = useAppSelector((state) => state.chronicles.chronicles)
  const loading = useAppSelector((state) => state.chronicles.loading)
  const dispatch = useAppDispatch()
  
  // Локальный state для корзины
  const [cartCount, setCartCount] = useState(0)
  const navigate = useNavigate()

  // Загрузка летописей при монтировании компонента
  useEffect(() => {
    dispatch(getChroniclesList())
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

