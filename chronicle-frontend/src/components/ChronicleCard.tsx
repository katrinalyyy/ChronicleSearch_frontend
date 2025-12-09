import { type FC } from 'react'
import { Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { type ChronicleResource } from '../modules/chronicleApi'
import { defaultImage } from '../constants/defaultImage'
import './ChronicleCard.css'

interface Props {
  chronicle: ChronicleResource
  imageClickHandler?: () => void
}

const ChronicleCard: FC<Props> = ({ chronicle, imageClickHandler }) => {
  return (
    <Card className="chronicle-card">
      <Card.Img 
        variant="top" 
        src={chronicle.image || defaultImage} 
        className="chronicle-card-image"
        onClick={imageClickHandler}
        onError={(e) => {
          // Если изображение не загрузилось (403, 404 и т.д.), показываем дефолтное
          e.currentTarget.src = defaultImage
        }}
      />
      <Card.Body className="chronicle-card-body">
        <Card.Title className="chronicle-card-title">
          {chronicle.title}
        </Card.Title>
        <div className="chronicle-card-info">
          <div className="info-item">
            <strong>Автор(ы):</strong> {chronicle.author}
          </div>
          <div className="info-item">
            <strong>Дата создания:</strong> {chronicle.date_of_creation}
          </div>
          <div className="info-item">
            <strong>Время действия:</strong> {chronicle.time_of_action}
          </div>
          <div className="info-item">
            <strong>Место:</strong> {chronicle.location}
          </div>
        </div>
        <div className="chronicle-card-actions">
          <Link to={`/chronicle/${chronicle.id}`} className="btn-details">
            Подробнее
          </Link>
        </div>
      </Card.Body>
    </Card>
  )
}

export default ChronicleCard

