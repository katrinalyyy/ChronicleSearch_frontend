import { type FC } from 'react'
import { Navbar, Container, Nav } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { ROUTES } from '../Routes'
import './Header.css'

const Header: FC = () => {
  return (
    <Navbar className="custom-header" expand="lg">
      <Container fluid>
        <div className="logo-container">
          <Link to={ROUTES.HOME} className="logo-link">
            <span className="logo-text">Культура.РФ</span>
          </Link>
        </div>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to={ROUTES.HOME} className="nav-link-custom">
              Главная
            </Nav.Link>
            <Nav.Link as={Link} to={ROUTES.CHRONICLES} className="nav-link-custom">
              Летописи
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Header

