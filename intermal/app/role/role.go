package role

type Role int

const (
	Researcher Role = iota // 0 - Исследователь (обычный пользователь)
	Moderator              // 1 - Модератор (администратор)
)

// String возвращает строковое представление роли
func (r Role) String() string {
	switch r {
	case Researcher:
		return "Исследователь"
	case Moderator:
		return "Модератор"
	default:
		return "Неизвестная роль"
	}
}
