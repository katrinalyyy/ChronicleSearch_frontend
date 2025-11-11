// Интерфейсы для данных летописей
export interface ChronicleResource {
  id: number
  title: string
  author: string
  date_of_creation: string
  time_of_action: string
  location: string
  image: string
  detailed_description?: string
  detailed_significance?: string
  detailed_editions?: string
}

export interface ChronicleListResponse {
  chronicleResources: ChronicleResource[]
  count: number
}

// Mock данные для работы без бэкенда
const mockChronicles: ChronicleResource[] = [
  {
    id: 1,
    title: 'Повесть временных лет',
    author: 'Нестор Летописец',
    date_of_creation: '1110-1118 гг.',
    time_of_action: 'IX-XII века',
    location: 'Киев',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Radzivil_Chronicle_manuscript.jpg/400px-Radzivil_Chronicle_manuscript.jpg',
    detailed_description: 'Древнейшая из дошедших до нас древнерусских летописей',
    detailed_significance: 'Важнейший источник по истории Древней Руси',
    detailed_editions: 'Лаврентьевская, Ипатьевская',
  },
  {
    id: 2,
    title: 'Новгородская первая летопись',
    author: 'Неизвестен',
    date_of_creation: 'XIII-XIV века',
    time_of_action: 'XI-XIV века',
    location: 'Новгород',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Novgorodcodex.jpg/400px-Novgorodcodex.jpg',
    detailed_description: 'Старейшая из новгородских летописей',
    detailed_significance: 'Важный источник по истории Новгородской республики',
    detailed_editions: 'Старший и Младший изводы',
  },
  {
    id: 3,
    title: 'Ипатьевская летопись',
    author: 'Неизвестен',
    date_of_creation: 'XV век',
    time_of_action: 'IX-XIII века',
    location: 'Киев, Галич',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Chronicle_of_Ipatiev.jpg/400px-Chronicle_of_Ipatiev.jpg',
    detailed_description: 'Летописный свод, содержащий Повесть временных лет и Галицко-Волынскую летопись',
    detailed_significance: 'Основной источник по истории Юго-Западной Руси',
    detailed_editions: 'Единственный список',
  },
]

// Функция для получения списка летописей с фильтрацией
export const getChronicles = async (searchQuery: string = '', location: string = ''): Promise<ChronicleListResponse> => {
  // Формируем параметры запроса
  const params = new URLSearchParams()
  if (searchQuery) params.append('title', searchQuery)
  if (location) params.append('location', location)
  
  const url = params.toString() 
    ? `/api/chronicle_resources?${params.toString()}`
    : '/api/chronicle_resources'
  
  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      // Преобразуем URL изображений для работы через proxy
      const resources = (data.data || []).map((item: ChronicleResource) => ({
        ...item,
        image: item.image ? item.image.replace('http://127.0.0.1:9000', '') : '',
      }))
      
      return {
        chronicleResources: resources,
        count: resources.length,
      }
    })
    .catch(() => {
      // В случае ошибки используем mock-данные, фильтруем по названию и городу
      console.warn('Using mock data: backend not available')
      let filteredChronicles = mockChronicles
      
      if (searchQuery) {
        filteredChronicles = filteredChronicles.filter((chronicle) => 
          chronicle.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      
      if (location) {
        filteredChronicles = filteredChronicles.filter((chronicle) => 
          chronicle.location.toLowerCase().includes(location.toLowerCase())
        )
      }
      
      return {
        chronicleResources: filteredChronicles,
        count: filteredChronicles.length,
      }
    })
}

// Функция для получения одной летописи по ID
export const getChronicleById = async (id: number): Promise<ChronicleResource | null> => {
  return fetch(`/api/chronicle_resources/${id}`)
    .then((response) => response.json())
    .then((data) => {
      if (!data.data) return null
      
      // Преобразуем URL изображения для работы через proxy
      return {
        ...data.data,
        image: data.data.image ? data.data.image.replace('http://127.0.0.1:9000', '') : '',
      }
    })
    .catch(() => {
      // В случае ошибки используем mock-данные, фильтруем по ID
      console.warn('Using mock data: backend not available')
      return mockChronicles.find((chronicle) => chronicle.id === id) || null
    })
}

// Интерфейс для ответа о черновике корзины
export interface DraftRequestInfo {
  request_id: number
  count: number
}

// Функция для получения информации о черновике корзины (заявки)
export const getChronicleResearchDraft = async (): Promise<DraftRequestInfo | null> => {
  return fetch('/api/ChronicleRequestList/chronicle_draft')
    .then((response) => {
      // Если 401 или 403 (не авторизован) - это нормально для гостя
      if (response.status === 401 || response.status === 403) {
        console.log('Guest mode: no research cart available (status:', response.status, ')')
        return null
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch draft info')
      }
      
      return response.json()
    })
    .then((data) => {
      if (!data || data.status !== 'success') return null
      
      return {
        request_id: data.request_id,
        count: data.count,
      }
    })
    .catch((error) => {
      // В случае ошибки возвращаем null (корзина будет неактивна)
      console.warn('Research cart unavailable:', error.message)
      return null
    })
}

