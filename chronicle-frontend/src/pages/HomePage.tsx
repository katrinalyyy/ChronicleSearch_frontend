import { type FC } from 'react'
import { Container, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { ROUTES } from '../Routes'
import './HomePage.css'

const HomePage: FC = () => {
  return (
    <>
      <Header />
      <Container fluid className="home-container">
        <div className="home-content">
          <h1 className="home-title">Лéтописи исследование</h1>
          <div className="home-description">
            <p className="description-text">
              Добро пожаловать на платформу "Культура.РФ" - гуманитарный просветительский проект, 
              посвященный описанию исторических событий с комментариями на выбранные источники.
            </p>
            <p className="description-text">
              Здесь вы можете изучать летописи и другие первичные источники с отрывками текста, 
              создавать собственные исследования и анализировать исторические документы.
            </p>
            <div className="home-buttons">
              <Link to={ROUTES.CHRONICLES}>
                <Button variant="primary" className="btn-primary-custom">
                  Просмотреть летописи
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
      <Footer />
    </>
  )
}

export default HomePage

