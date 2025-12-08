import { type FC, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Row, Col, Spinner, Image, Button } from 'react-bootstrap'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Breadcrumbs from '../components/Breadcrumbs'
import ResearchCartButton from '../components/ResearchCartButton'
import { getChronicleById, type ChronicleResource } from '../modules/chronicleApi'
import { ROUTES, ROUTE_LABELS } from '../Routes'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { getDraftRequestInfo, addChronicleToRequest } from '../store/draftRequestSlice'
import { defaultImage } from '../constants/defaultImage'
import './ChronicleDetailPage.css'

const ChronicleDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>()
  const [pageData, setPageData] = useState<ChronicleResource | null>(null)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  
  // Redux state для корзины
  const { count: cartCount, request_id } = useAppSelector((state) => state.draftRequest)
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)

  useEffect(() => {
    // Загрузка данных летописи при монтировании компонента
    if (id) {
      getChronicleById(parseInt(id)).then((data) => {
        setPageData(data)
      })
    }
  }, [id])

  useEffect(() => {
    // Загружаем корзину при монтировании, если пользователь авторизован
    if (isAuthenticated) {
      // Всегда загружаем корзину, чтобы получить актуальное состояние
      dispatch(getDraftRequestInfo())
    }
  }, [isAuthenticated, dispatch])
  
  // Отладочный вывод для проверки состояния корзины
  useEffect(() => {
    console.log('ChronicleDetailPage - cartCount:', cartCount, 'request_id:', request_id, 'isAuthenticated:', isAuthenticated)
  }, [cartCount, request_id, isAuthenticated])

  // Обработчик клика на корзину
  const handleCartClick = async () => {
    // Если корзина пустая, переходим на страницу черновика
    if (!request_id || request_id === 0 || cartCount === 0) {
      navigate(ROUTES.DRAFT)
      return
    }
    
    // Если есть request_id, переходим на страницу заявки
    if (isAuthenticated) {
      navigate(`${ROUTES.REQUEST}/${request_id}`)
    }
  }

  // Обработчик добавления летописи в заявку
  const handleAddToRequest = async () => {
    if (pageData?.id) {
      try {
        await dispatch(addChronicleToRequest(pageData.id)).unwrap()
      } catch (error) {
        console.error('Ошибка при добавлении в заявку:', error)
      }
    }
  }

  return (
    <>
      <Header />
      <ResearchCartButton 
        count={cartCount} 
        onClick={handleCartClick}
        disabled={!isAuthenticated}
      />
      
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
            <div className="chronicle-content">
              <div className="chronicle-header">
                <h2 className="chronicle-title">{pageData.title}</h2>
                {isAuthenticated && (
                  <Button 
                    variant="danger" 
                    className="add-button"
                    onClick={handleAddToRequest}
                  >
                    Добавить
                  </Button>
                )}
              </div>
              <Row>
                <Col md={6}>
                  <div className="chronicle-image-wrapper">
                    <div className="chronicle-image">
                      <Image
                        src={pageData.image || defaultImage}
                        alt="Изображение летописи"
                        className="chronicle-detail-image"
                        onError={(e) => {
                          e.currentTarget.src = defaultImage
                        }}
                      />
                    </div>
                  </div>
                </Col>
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

