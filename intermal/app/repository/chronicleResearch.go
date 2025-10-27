package repository

import (
	"Lab1/intermal/app/ds"
	"errors"

	"gorm.io/gorm"
)

// Chronicle Research (м-м связь) методы

// удаляем хронику из заявки (без PK м-м)
func (r *Repository) DeleteChronicleResearchFromRequest(requestID uint, chronicleID uint) error {
	var request ds.RequestChronicleResearch
	err := r.db.Where("id = ? AND status = ?", requestID, ds.RequestStatusDraft).First(&request).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("draft request not found")
		}
		return err
	}

	// минус связь между заявкой и хроникой
	tx := r.db.Where("id_request_research = ? AND id_resource = ?", requestID, chronicleID).Delete(&ds.ChronicleResearch{})
	if tx.Error != nil {
		return tx.Error
	}
	if tx.RowsAffected == 0 {
		return errors.New("chronicle not found in request")
	}
	return nil
}

// обновляет м-м запись (количество/порядок/значения)
func (r *Repository) UpdateChronicleResearchInRequest(requestID uint, chronicleID uint, updates map[string]interface{}) error {
	// чек заявка существует и является черновиком
	var request ds.RequestChronicleResearch
	err := r.db.Where("id = ? AND status = ?", requestID, ds.RequestStatusDraft).First(&request).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("draft request not found")
		}
		return err
	}

	// минус системные поля из обновления
	allowedFields := map[string]bool{
		"quote":      true,
		"is_matched": true,
	}

	filteredUpdates := make(map[string]interface{})
	for key, value := range updates {
		if allowedFields[key] {
			filteredUpdates[key] = value
		}
	}

	if len(filteredUpdates) == 0 {
		return errors.New("no valid fields to update")
	}

	tx := r.db.Model(&ds.ChronicleResearch{}).
		Where("id_request_research = ? AND id_resource = ?", requestID, chronicleID).
		Updates(filteredUpdates)

	if tx.Error != nil {
		return tx.Error
	}
	if tx.RowsAffected == 0 {
		return errors.New("chronicle not found in request")
	}
	return nil
}
