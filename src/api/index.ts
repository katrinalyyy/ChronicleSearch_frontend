import { Api } from './Api';

export const api = new Api({
  baseURL: '', // Используем Vite proxy, поэтому baseURL пустой
});

