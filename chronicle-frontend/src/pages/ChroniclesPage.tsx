import { type FC, useState, useEffect } from 'react'
import { Container, Row, Col, Form, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ChronicleCard from '../components/ChronicleCard'
import Breadcrumbs from '../components/Breadcrumbs'
import { getChronicles, type ChronicleResource } from '../modules/chronicleApi'
import { ROUTE_LABELS } from '../Routes'
import './ChroniclesPage.css'

const ChroniclesPage: FC = () => {
  const [searchValue, setSearchValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [chronicles, setChronicles] = useState<ChronicleResource[]>([])
  const navigate = useNavigate()

  // Загрузка летописей при монтировании компонента
  useEffect(() => {
    loadChronicles()
  }, [])

  const loadChronicles = (query: string = '') => {
    setLoading(true)
    getChronicles(query)
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
    loadChronicles(searchValue)
  }

  // Обработчик клика на карточку - переход на страницу детального просмотра
  const handleCardClick = (id: number) => {
    navigate(`/chronicle/${id}`)
  }

  return (
    <>
      <Header />
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
              onChange={(e) => setSearchValue(e.target.value)}
              className="search-input"
            />
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

