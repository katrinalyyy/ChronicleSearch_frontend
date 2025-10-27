package ds

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
)

type RequestStatus string

const (
	RequestStatusDraft     RequestStatus = "черновик"
	RequestStatusDeleted   RequestStatus = "удалён"
	RequestStatusFormed    RequestStatus = "сформирован"
	RequestStatusCompleted RequestStatus = "завершён"
	RequestStatusRejected  RequestStatus = "отклонён"
)

type RequestChronicleResearch struct {
	ID          uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	Name        string `gorm:"type:varchar(100);not null" json:"name"`
	SearchEvent string `gorm:"type:varchar(100)" json:"search_event"`

	Status      RequestStatus `gorm:"type:varchar(20);not null;check:status IN ('черновик','удалён','сформирован','завершён','отклонён')" json:"status"`
	CreatedAt   time.Time     `gorm:"not null" json:"created_at"`
	FormedAt    sql.NullTime  `gorm:"default:null" json:"formed_at"`
	CompletedAt sql.NullTime  `gorm:"default:null" json:"completed_at"`
	CreatorID   uuid.UUID     `gorm:"type:uuid;not null" json:"-"`
	ModeratorID *uuid.UUID    `gorm:"type:uuid;default:null" json:"-"`

	Creator   User `gorm:"foreignKey:CreatorID;references:UUID" json:"creator"`
	Moderator User `gorm:"foreignKey:ModeratorID;references:UUID" json:"moderator"`
}
