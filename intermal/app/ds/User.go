package ds

import (
	"Lab1/intermal/app/role"

	"github.com/google/uuid"
)

type User struct {
	UUID uuid.UUID `gorm:"type:uuid;primaryKey" json:"uuid"`
	Name string    `json:"name"`
	Role role.Role `sql:"type:string;" json:"role"`
	Pass string    `json:"pass"`
}
