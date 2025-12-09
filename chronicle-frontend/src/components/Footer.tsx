import { type FC } from 'react'
import './Footer.css'

const Footer: FC = () => {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-text-container">
          <span className="first-letter">К</span>
          <div className="footer-text">
            "Культура.РФ" - гуманитарный просветительский проект, посвященный описанию исторических 
            событий с комментариями на выбранные источники. Предоставление летописей и других первичных 
            источников с отрывками текста.
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

