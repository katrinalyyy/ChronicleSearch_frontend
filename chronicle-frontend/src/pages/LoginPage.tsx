import { type FC, useState, type ChangeEvent, type FormEvent, useEffect } from 'react';
import { Form, Button, Alert, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { loginUserAsync, clearError } from '../store/authSlice';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ROUTES } from '../Routes';
import './LoginPage.css';

const LoginPage: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { error, loading, isAuthenticated } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({ login: '', password: '' });

  // Если уже авторизован, перенаправляем на главную
  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.CHRONICLES);
    }
  }, [isAuthenticated, navigate]);

  // Очищаем ошибку при размонтировании
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Обработчик события изменения полей ввода
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Обработчик события нажатия на кнопку "Войти"
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (formData.login && formData.password) {
      const result = await dispatch(loginUserAsync(formData));
      // Если успешно авторизовались, перенаправляем на страницу летописей
      if (loginUserAsync.fulfilled.match(result)) {
        navigate(ROUTES.CHRONICLES);
      }
    }
  };

  return (
    <>
      <Header />
      <Container className="login-container">
        <Container className="login-form-container">
          <h2 className="login-title">Рады снова Вас видеть!</h2>
          {error && (
            <Alert variant="danger" dismissible onClose={() => dispatch(clearError())}>
              {error}
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="login" className="mb-3">
              <Form.Label>Имя пользователя</Form.Label>
              <Form.Control
                type="text"
                name="login"
                value={formData.login}
                onChange={handleChange}
                placeholder="Введите имя пользователя"
                required
                disabled={loading}
              />
            </Form.Group>
            <Form.Group controlId="password" className="mb-3">
              <Form.Label>Пароль</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Введите пароль"
                required
                disabled={loading}
              />
            </Form.Group>
            <Button variant="danger" type="submit" className="w-100 login-button" disabled={loading}>
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </Form>
        </Container>
      </Container>
      <Footer />
    </>
  );
};

export default LoginPage;

