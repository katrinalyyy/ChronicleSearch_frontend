import { type FC } from 'react'
import { Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import type { Lab1IntermalAppDsChronicleResource } from '../api/Api'
import { defaultImage } from '../constants/defaultImage'
import './ChronicleCard.css'

interface Props {
  chronicle: Lab1IntermalAppDsChronicleResource
  imageClickHandler?: () => void
  onAddToRequest?: () => void
  showAddButton?: boolean
}

const ChronicleCard: FC<Props> = ({ chronicle, imageClickHandler, onAddToRequest, showAddButton = false }) => {
  // Проверяем что id существует
  if (!chronicle.id) {
    return null
  }

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
          {chronicle.title || 'Без названия'}
        </Card.Title>
        <div className="chronicle-card-info">
          <div className="info-item">
            <strong>Автор(ы):</strong> {chronicle.author || 'Неизвестен'}
          </div>
          <div className="info-item">
            <strong>Дата создания:</strong> {chronicle.date_of_creation || 'Не указана'}
          </div>
          <div className="info-item">
            <strong>Время действия:</strong> {chronicle.time_of_action || 'Не указано'}
          </div>
          <div className="info-item">
            <strong>Место:</strong> {chronicle.location || 'Не указано'}
          </div>
        </div>
        <div className="chronicle-card-actions">
          {showAddButton && onAddToRequest && (
            <button 
              className="btn-details"
              onClick={onAddToRequest}
            >
              Добавить
            </button>
          )}
          <Link to={`/chronicle/${chronicle.id}`} className="btn-details">
            Подробнее
          </Link>
        </div>
      </Card.Body>
    </Card>
  )
}

export default ChronicleCard

