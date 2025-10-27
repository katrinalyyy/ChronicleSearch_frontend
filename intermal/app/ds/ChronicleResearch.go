package ds

type ChronicleResearch struct {
	ID                uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	IDRequestResearch uint   `gorm:"not null;uniqueIndex:idx_request_resource" json:"id_request_research"`
	IDResource        uint   `gorm:"not null;uniqueIndex:idx_request_resource" json:"id_resource"`
	Quote             string `gorm:"type:text" json:"quote"`
	IsMatched         bool   `gorm:"type:boolean;default:false" json:"is_matched"`

	Request           RequestChronicleResearch `gorm:"foreignKey:IDRequestResearch" json:"-"` // Не включать в JSON
	ChronicleResource ChronicleResource        `gorm:"foreignKey:IDResource" json:"chronicle_resource"`
}
