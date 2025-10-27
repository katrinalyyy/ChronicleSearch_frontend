package repository

import (
	"Lab1/intermal/app/ds"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (r *Repository) GetRequestChronicleResearch(status string, dateFrom, dateTo *time.Time) ([]ds.RequestChronicleResearch, error) {
	var requests []ds.RequestChronicleResearch
	query := r.db.Where("status != ? AND status != ?", ds.RequestStatusDeleted, ds.RequestStatusDraft)

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if dateFrom != nil {
		query = query.Where("formed_at >= ?", *dateFrom)
	}
	if dateTo != nil {
		query = query.Where("formed_at <= ?", *dateTo)
	}

	err := query.Preload("Creator").Preload("Moderator").Order("formed_at DESC").Find(&requests).Error
	return requests, err
}

// GetRequestChronicleResearchByCreator возвращает заявки конкретного пользователя
func (r *Repository) GetRequestChronicleResearchByCreator(creatorID string, status string, dateFrom, dateTo *time.Time) ([]ds.RequestChronicleResearch, error) {
	var requests []ds.RequestChronicleResearch
	query := r.db.Where("creator_id = ? AND status != ? AND status != ?", creatorID, ds.RequestStatusDeleted, ds.RequestStatusDraft)

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if dateFrom != nil {
		query = query.Where("formed_at >= ?", *dateFrom)
	}
	if dateTo != nil {
		query = query.Where("formed_at <= ?", *dateTo)
	}

	err := query.Preload("Creator").Preload("Moderator").Order("formed_at DESC").Find(&requests).Error
	return requests, err
}

func (r *Repository) GetRequestChronicleResearchByID(id uint) (ds.RequestChronicleResearch, error) {
	var request ds.RequestChronicleResearch
	err := r.db.Preload("Creator").Preload("Moderator").Where("id = ? AND status != ?", id, ds.RequestStatusDeleted).First(&request).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ds.RequestChronicleResearch{}, errors.New("request not found")
		}
		return ds.RequestChronicleResearch{}, err
	}
	return request, nil
}

func (r *Repository) GetRequestWithChronicles(id uint) (ds.RequestChronicleResearch, []ds.ChronicleResearch, error) {
	request, err := r.GetRequestChronicleResearchByID(id)
	if err != nil {
		return ds.RequestChronicleResearch{}, nil, err
	}

	var chronicles []ds.ChronicleResearch
	err = r.db.Preload("ChronicleResource").Where("id_request_research = ?", id).Find(&chronicles).Error
	if err != nil {
		return ds.RequestChronicleResearch{}, nil, err
	}

	return request, chronicles, nil
}

func (r *Repository) CreateRequestChronicleResearch(creatorID uuid.UUID) (ds.RequestChronicleResearch, error) {
	request := ds.RequestChronicleResearch{
		Name:        "", // Пустое имя для черновика
		SearchEvent: "",
		Status:      ds.RequestStatusDraft,
		CreatedAt:   time.Now(),
		CreatorID:   creatorID,
	}

	err := r.db.Create(&request).Error
	return request, err
}

func (r *Repository) UpdateRequestChronicleResearch(id uint, request ds.RequestChronicleResearch) error {
	var existingRequest ds.RequestChronicleResearch
	err := r.db.Where("id = ? AND status != ?", id, ds.RequestStatusDeleted).First(&existingRequest).Error
	if err != nil {
		return err
	}

	updates := map[string]interface{}{
		"name":         request.Name,
		"search_event": request.SearchEvent,
	}

	return r.db.Model(&existingRequest).Updates(updates).Error
}

func (r *Repository) UpdateRequestStatus(id uint, newStatus ds.RequestStatus, moderatorID *uuid.UUID) error {
	var request ds.RequestChronicleResearch
	err := r.db.Where("id = ? AND status != ?", id, ds.RequestStatusDeleted).First(&request).Error
	if err != nil {
		return err
	}

	if !r.isValidStatusTransition(request.Status, newStatus) {
		return fmt.Errorf("недопустимый переход статуса с %s на %s", request.Status, newStatus)
	}

	updates := map[string]interface{}{
		"status": newStatus,
	}

	switch newStatus {
	case ds.RequestStatusFormed:
		updates["formed_at"] = time.Now()
	case ds.RequestStatusCompleted, ds.RequestStatusRejected:
		updates["completed_at"] = time.Now()
		if moderatorID != nil {
			updates["moderator_id"] = *moderatorID
		}
	}

	return r.db.Model(&ds.RequestChronicleResearch{}).Where("id = ?", id).Updates(updates).Error
}

// чек допустимость перехода между статусами
func (r *Repository) isValidStatusTransition(current, new ds.RequestStatus) bool {
	validTransitions := map[ds.RequestStatus][]ds.RequestStatus{
		ds.RequestStatusDraft:     {ds.RequestStatusDeleted, ds.RequestStatusFormed},
		ds.RequestStatusFormed:    {ds.RequestStatusCompleted, ds.RequestStatusRejected},
		ds.RequestStatusCompleted: {},
		ds.RequestStatusRejected:  {},
		ds.RequestStatusDeleted:   {},
	}

	allowedStatuses, exists := validTransitions[current]
	if !exists {
		return false
	}

	for _, status := range allowedStatuses {
		if status == new {
			return true
		}
	}
	return false
}

// помечает заявку как удаленную (только создатель)
func (r *Repository) DeleteRequestChronicleResearch(id uint, creatorID uuid.UUID) error {
	tx := r.db.Model(&ds.RequestChronicleResearch{}).
		Where("id = ? AND creator_id = ? AND status = ?", id, creatorID, ds.RequestStatusDraft).
		Update("status", ds.RequestStatusDeleted)

	if tx.Error != nil {
		return tx.Error
	}
	if tx.RowsAffected == 0 {
		return errors.New("request not found or cannot be deleted")
	}
	return nil
}

// переводит заявку в статус "сформирован" (только создатель)
func (r *Repository) FormRequestChronicleResearch(id uint, creatorID uuid.UUID) error {
	// Проверяем что это черновик текущего пользователя
	draft, _, err := r.GetDraftRequestChronicleResearchInfo(creatorID)
	if err != nil || draft.ID != id {
		return fmt.Errorf("доступен только черновик текущего пользователя")
	}

	var count int64
	err = r.db.Model(&ds.ChronicleResearch{}).Where("id_request_research = ?", id).Count(&count).Error
	if err != nil {
		return err
	}
	if count == 0 {
		return fmt.Errorf("заявка пуста")
	}

	if draft.Name == "" || draft.SearchEvent == "" {
		return fmt.Errorf("необходимо заполнить название и событие поиска")
	}

	return r.UpdateRequestStatus(id, ds.RequestStatusFormed, nil)
}

// завершает заявку (только модератор)
func (r *Repository) CompleteRequestChronicleResearch(id uint, moderatorID uuid.UUID) error {
	// Выполняем расчеты при завершении заявки
	err := r.calculateRequestMetrics(id)
	if err != nil {
		return fmt.Errorf("ошибка при расчете метрик: %v", err)
	}

	return r.UpdateRequestStatus(id, ds.RequestStatusCompleted, &moderatorID)
}

// отклоняет заявку (только модератор)
func (r *Repository) RejectRequestChronicleResearch(id uint, moderatorID uuid.UUID) error {
	return r.UpdateRequestStatus(id, ds.RequestStatusRejected, &moderatorID)
}

// выполняет расчеты при завершении заявки
func (r *Repository) calculateRequestMetrics(requestID uint) error {

	// Пример расчета количества хроник в заявке
	var count int64
	err := r.db.Model(&ds.ChronicleResearch{}).Where("id_request_research = ?", requestID).Count(&count).Error
	if err != nil {
		return err
	}

	// TODO разобраться как добавить сюда подсчет для галочек

	return nil
}

// AddChronicleToRequest добавляет хронику в заявку-черновик
func (r *Repository) AddChronicleToRequest(requestID uint, chronicleID uint, quote string) error {
	// Проверяем что заявка существует и является черновиком
	var request ds.RequestChronicleResearch
	err := r.db.Where("id = ? AND status = ?", requestID, ds.RequestStatusDraft).First(&request).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("draft request not found")
		}
		return err
	}

	// Создаем связь между заявкой и хроникой
	research := ds.ChronicleResearch{
		IDRequestResearch: requestID,
		IDResource:        chronicleID,
		Quote:             quote,
		IsMatched:         false,
	}

	err = r.db.Create(&research).Error
	return err
}

// GetDraftRequestChronicleResearchInfo возвращает информацию о черновике заявки
func (r *Repository) GetDraftRequestChronicleResearchInfo(creatorID uuid.UUID) (ds.RequestChronicleResearch, []ds.ChronicleResearch, error) {
	var request ds.RequestChronicleResearch
	err := r.db.Preload("Creator").Preload("Moderator").Where("creator_id = ? AND status = ?", creatorID, ds.RequestStatusDraft).First(&request).Error
	if err != nil {
		return ds.RequestChronicleResearch{}, nil, err
	}

	var research []ds.ChronicleResearch
	err = r.db.Preload("ChronicleResource").Where("id_request_research = ?", request.ID).Find(&research).Error
	if err != nil {
		return request, nil, err
	}

	return request, research, nil
}

// GetDraftRequestInfo возвращает ID черновика и количество услуг в корзине
func (r *Repository) GetDraftRequestInfo(creatorID uuid.UUID) (uint, int, error) {
	var request ds.RequestChronicleResearch
	err := r.db.Where("creator_id = ? AND status = ?", creatorID, ds.RequestStatusDraft).First(&request).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return 0, 0, nil // Нет черновика
		}
		return 0, 0, err
	}

	var count int64
	err = r.db.Model(&ds.ChronicleResearch{}).Where("id_request_research = ?", request.ID).Count(&count).Error
	if err != nil {
		return 0, 0, err
	}

	return request.ID, int(count), nil
}

// CreateRequestChronicleResearchWithChronicle создает заявку-черновик с хроникой
func (r *Repository) CreateRequestChronicleResearchWithChronicle(creatorID uuid.UUID, chronicleID uint) (ds.RequestChronicleResearch, error) {
	request := ds.RequestChronicleResearch{
		Name:        "",
		SearchEvent: "",
		Status:      ds.RequestStatusDraft,
		CreatedAt:   time.Now(),
		CreatorID:   creatorID,
	}

	err := r.db.Create(&request).Error
	if err != nil {
		return ds.RequestChronicleResearch{}, err
	}

	err = r.AddChronicleToRequest(request.ID, chronicleID, "")
	if err != nil {
		return ds.RequestChronicleResearch{}, err
	}

	return request, nil
}
