import { type FC } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../Routes'
import './Breadcrumbs.css'

// Интерфейс для одной "крошки"
interface ICrumb {
  label: string
  path?: string
}

// Пропсы компонента
interface BreadcrumbsProps {
  crumbs: ICrumb[]
}

export const Breadcrumbs: FC<BreadcrumbsProps> = (props) => {
  const { crumbs } = props

  return (
    <ul className="breadcrumbs">
      {/* Главная страница всегда первая */}
      <li>
        <Link to={ROUTES.HOME}>Главная</Link>
      </li>
      
      {/* Остальные крошки */}
      {!!crumbs.length &&
        crumbs.map((crumb, index) => (
          <span key={index}>
            <li className="slash">/</li>
            {index === crumbs.length - 1 ? (
              // Последняя крошка - не активна (текущая страница)
              <li>{crumb.label}</li>
            ) : (
              // Промежуточные крошки - активные ссылки
              <li>
                <Link to={crumb.path || ''}>{crumb.label}</Link>
              </li>
            )}
          </span>
        ))}
    </ul>
  )
}

export default Breadcrumbs

