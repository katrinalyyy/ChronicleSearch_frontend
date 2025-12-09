import { type FC } from 'react'
import { Navbar, Container, Nav, Button } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { logoutUserAsync } from '../store/authSlice'
import { ROUTES } from '../Routes'
import './Header.css'

const Header: FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, username } = useAppSelector((state) => state.auth)

  const handleLogout = async () => {
    await dispatch(logoutUserAsync())
    navigate(ROUTES.HOME)
  }

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
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to={ROUTES.HOME} className="nav-link-custom">
              Главная
            </Nav.Link>
            <Nav.Link as={Link} to={ROUTES.CHRONICLES} className="nav-link-custom">
              Летописи
            </Nav.Link>
            {isAuthenticated ? (
              <>
                <Nav.Link as={Link} to={ROUTES.REQUESTS_LIST} className="nav-link-custom">
                  Мои заявки
                </Nav.Link>
                <Nav.Link as={Link} to={ROUTES.DRAFT} className="nav-link-custom">
                  Черновик
                </Nav.Link>
                <Nav.Link as={Link} to={ROUTES.USER_PROFILE} className="nav-link-custom">
                  {username}
                </Nav.Link>
                <Button variant="outline-light" onClick={handleLogout} className="ms-2">
                  Выйти
                </Button>
              </>
            ) : (
              <Link to={ROUTES.LOGIN} className="ms-2">
                <Button variant="outline-light">
                  Войти
                </Button>
              </Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Header

