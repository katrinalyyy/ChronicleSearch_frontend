import { type FC, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Row, Col, Spinner, Image } from 'react-bootstrap'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Breadcrumbs from '../components/Breadcrumbs'
import ResearchCartButton from '../components/ResearchCartButton'
import { getChronicleById, getChronicleResearchDraft, type ChronicleResource } from '../modules/chronicleApi'
import { ROUTES, ROUTE_LABELS } from '../Routes'
import { defaultImage } from '../constants/defaultImage'
import './ChronicleDetailPage.css'

const ChronicleDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>()
  const [pageData, setPageData] = useState<ChronicleResource | null>(null)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    // Загрузка данных летописи при монтировании компонента
    if (id) {
      getChronicleById(parseInt(id)).then((data) => {
        setPageData(data)
      })
    }
    loadCartInfo()
  }, [id])

  // Загрузка информации о корзине
  const loadCartInfo = () => {
    getChronicleResearchDraft()
      .then((data) => {
        if (data) {
          setCartCount(data.count)
        } else {
          setCartCount(0)
        }
      })
      .catch(() => {
        setCartCount(0)
      })
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
      
      {/* Пример использования BreadCrumbs на странице летописи (название получаем из запроса) */}
      <Breadcrumbs
        crumbs={[
          { label: ROUTE_LABELS.CHRONICLES, path: ROUTES.CHRONICLES },
          { label: pageData?.title || 'Летопись' },
        ]}
      />

      <div>
        {pageData ? (
          // Если данные загружены, отображаем контент
          <main className="chronicle-details">
            <h2 className="chronicle-title">{pageData.title}</h2>

            <div className="chronicle-content">
              <Row>
                <Col md={6}>
                  <div className="chronicle-specs">
                    <div className="spec-item">
                      <strong>Автор(ы):</strong> {pageData.author}
                    </div>
                    <div className="spec-item">
                      <strong>Дата создания:</strong> {pageData.date_of_creation}
                    </div>
                    <div className="spec-item">
                      <strong>Время действия:</strong> {pageData.time_of_action}
                    </div>
                    <div className="spec-item">
                      <strong>Место:</strong> {pageData.location}
                    </div>
                    {pageData.detailed_description && (
                      <div className="spec-item">
                        <strong>Описание источника:</strong> {pageData.detailed_description}
                      </div>
                    )}
                    {pageData.detailed_significance && (
                      <div className="spec-item">
                        <strong>Историческая значимость:</strong> {pageData.detailed_significance}
                      </div>
                    )}
                    {pageData.detailed_editions && (
                      <div className="spec-item">
                        <strong>Основные редакции:</strong> {pageData.detailed_editions}
                      </div>
                    )}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="chronicle-image">
                    <Image
                      src={pageData.image || defaultImage}
                      alt="Изображение летописи"
                      width={400}
                      onError={(e) => {
                        // Если изображение не загрузилось, показываем дефолтное
                        e.currentTarget.src = defaultImage
                      }}
                    />
                  </div>
                </Col>
              </Row>
            </div>
          </main>
        ) : (
          // Если данные еще не загружены, показываем спиннер
          <div className="chronicle_page_loader_block">
            <Spinner animation="border" />
          </div>
        )}
      </div>

      <Footer />
    </>
  )
}

export default ChronicleDetailPage

