import { type FC, useState, useEffect } from 'react'
import { Container, Form, Button, Alert, Card } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Breadcrumbs from '../components/Breadcrumbs'
import { ROUTES, ROUTE_LABELS } from '../Routes'
import { useAppSelector } from '../store/hooks'
import { api } from '../api'
import './UserProfilePage.css'

const UserProfilePage: FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated, username } = useAppSelector((state) => state.auth)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [userData, setUserData] = useState({
    name: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN)
      return
    }

    // Загружаем данные профиля
    loadUserProfile()
  }, [isAuthenticated, navigate])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      const response = await api.api.userProfileList()
      if (response.data) {
        setUserData((prev) => ({
          ...prev,
          name: response.data.name || username || '',
        }))
      }
    } catch (error: any) {
      console.error('Failed to load user profile:', error)
      setError('Не удалось загрузить данные профиля')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Очищаем сообщения об ошибках при изменении полей
    if (error) setError(null)
    if (success) setSuccess(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Валидация
    if (!userData.name || !userData.name.trim()) {
      setError('Имя пользователя не может быть пустым')
      return
    }

    // Если меняется пароль, проверяем все поля пароля
    if (userData.newPassword || userData.confirmPassword || userData.currentPassword) {
      if (!userData.currentPassword) {
        setError('Для изменения пароля необходимо ввести текущий пароль')
        return
      }
      if (!userData.newPassword) {
        setError('Введите новый пароль')
        return
      }
      if (userData.newPassword.length < 6) {
        setError('Новый пароль должен содержать не менее 6 символов')
        return
      }
      if (userData.newPassword !== userData.confirmPassword) {
        setError('Новый пароль и подтверждение не совпадают')
        return
      }
    }

    try {
      setLoading(true)
      
      // Подготавливаем данные для отправки
      const updateData: { name?: string; password?: string } = {
        name: userData.name.trim(),
      }

      // Добавляем пароль только если он указан
      if (userData.newPassword) {
        updateData.password = userData.newPassword
      }

      const response = await api.api.userProfileUpdate(updateData)
      
      if (response.data) {
        setSuccess('Профиль успешно обновлен')
        // Очищаем поля паролей после успешного обновления
        setUserData((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }))
        
        // Перезагружаем профиль для получения обновленных данных
        await loadUserProfile()
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error)
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Ошибка при обновлении профиля'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <Header />
      <Breadcrumbs
        crumbs={[
          { label: ROUTE_LABELS.HOME, path: ROUTES.HOME },
          { label: 'Личный кабинет' },
        ]}
      />
      <Container className="user-profile-container">
        <Card className="profile-card">
          <Card.Header className="profile-card-header">
            <h1 className="profile-title">Личный кабинет</h1>
          </Card.Header>
          <Card.Body>
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
                {success}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Имя пользователя</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={userData.name}
                  onChange={handleInputChange}
                  placeholder="Введите имя пользователя"
                  required
                  disabled={loading}
                />
              </Form.Group>

              <hr className="profile-divider" />

              <h3 className="profile-section-title">Изменение пароля</h3>
              <p className="profile-section-description">
                Оставьте поля пароля пустыми, если не хотите менять пароль
              </p>

              <Form.Group className="mb-3">
                <Form.Label>Текущий пароль</Form.Label>
                <Form.Control
                  type="password"
                  name="currentPassword"
                  value={userData.currentPassword}
                  onChange={handleInputChange}
                  placeholder="Введите текущий пароль"
                  disabled={loading}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Новый пароль</Form.Label>
                <Form.Control
                  type="password"
                  name="newPassword"
                  value={userData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Введите новый пароль (минимум 6 символов)"
                  disabled={loading}
                  minLength={6}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Подтверждение нового пароля</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={userData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Повторите новый пароль"
                  disabled={loading}
                />
              </Form.Group>

              <div className="profile-actions">
                <Button
                  variant="danger"
                  type="submit"
                  disabled={loading}
                  className="save-button"
                >
                  {loading ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
      <Footer />
    </>
  )
}

export default UserProfilePage

