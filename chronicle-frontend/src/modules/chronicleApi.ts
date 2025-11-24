declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown
  }
}

const API_BASE_URL = window.__TAURI_INTERNALS__ 
  ? 'http://192.168.200.17:8080' 
  : ''

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
    ? `${API_BASE_URL}/api/chronicle_resources?${params.toString()}`
    : `${API_BASE_URL}/api/chronicle_resources`
  
  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const resources = (data.data || []).map((item: ChronicleResource) => {
        let imageUrl = item.image || ''
        
        if (window.__TAURI_INTERNALS__ && imageUrl) {
          imageUrl = imageUrl.replace('http://127.0.0.1:9000', 'http://192.168.200.17:9000')
        } else {
          imageUrl = imageUrl.replace('http://127.0.0.1:9000', '')
        }
        
        return {
          ...item,
          image: imageUrl,
        }
      })
      
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
  return fetch(`${API_BASE_URL}/api/chronicle_resources/${id}`)
    .then((response) => response.json())
    .then((data) => {
      if (!data.data) return null
      
      // Преобразуем URL изображения
      let imageUrl = data.data.image || ''
      
      // В Tauri заменяем localhost на IP адрес
      if (window.__TAURI_INTERNALS__ && imageUrl) {
        imageUrl = imageUrl.replace('http://127.0.0.1:9000', 'http://192.168.200.17:9000')
      } else {
        // В dev режиме убираем хост для работы через proxy
        imageUrl = imageUrl.replace('http://127.0.0.1:9000', '')
      }
      
      return {
        ...data.data,
        image: imageUrl,
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
export const getChronicleResearchDraft = async (): Promise<DraftRequestInfo> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ChronicleRequestList/chronicle_draft`)
    
    // Если запрос неуспешен (любая ошибка 4xx или 5xx) - возвращаем пустую корзину
    if (!response.ok) {
      // Просто логируем без ошибки
      console.log(`Cart request: ${response.status} - returning empty cart`)
      return { request_id: 0, count: 0 }
    }
    
    const data = await response.json()
    
    // Если данных нет или запрос неуспешен, возвращаем пустую корзину
    if (!data || data.status !== 'success') {
      return { request_id: 0, count: 0 }
    }
    
    return {
      request_id: data.request_id,
      count: data.count,
    }
  } catch (error) {
    // В случае любой ошибки возвращаем пустую корзину (count: 0)
    console.log('Cart unavailable - returning empty cart')
    return { request_id: 0, count: 0 }
  }
}

