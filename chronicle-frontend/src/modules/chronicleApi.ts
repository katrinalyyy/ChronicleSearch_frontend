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
    image: '', // Пустая строка - будет использоваться дефолтное изображение
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
    image: '', // Пустая строка - будет использоваться дефолтное изображение
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
    image: '', // Пустая строка - будет использоваться дефолтное изображение
    detailed_description: 'Летописный свод, содержащий Повесть временных лет и Галицко-Волынскую летопись',
    detailed_significance: 'Основной источник по истории Юго-Западной Руси',
    detailed_editions: 'Единственный список',
  },
]

// Функция для получения списка летописей с фильтрацией
export const getChronicles = async (searchQuery: string = ''): Promise<ChronicleListResponse> => {
  const url = searchQuery 
    ? `/api/chronicle_resources?chronicle=${encodeURIComponent(searchQuery)}`
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
      // В случае ошибки используем mock-данные, фильтруем по названию
      console.warn('Using mock data: backend not available')
      const filteredChronicles = searchQuery
        ? mockChronicles.filter((chronicle) => 
            chronicle.title.toLowerCase().startsWith(searchQuery.toLowerCase())
          )
        : mockChronicles
      
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

