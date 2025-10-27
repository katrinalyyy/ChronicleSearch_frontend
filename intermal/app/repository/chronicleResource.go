package repository

import (
	"Lab1/intermal/app/ds"
	"context"
	"errors"
	"fmt"
	"io"
	"strings"
	"time"

	"github.com/minio/minio-go/v7"
	"gorm.io/gorm"
)

func (r *Repository) GetChronicleResources(title, author, location string) ([]ds.ChronicleResource, error) {
	var resources []ds.ChronicleResource
	query := r.db

	if title != "" {
		query = query.Where("title ILIKE ?", "%"+title+"%")
	}
	if author != "" {
		query = query.Where("author ILIKE ?", "%"+author+"%")
	}
	if location != "" {
		query = query.Where("location ILIKE ?", "%"+location+"%")
	}

	err := query.Find(&resources).Error
	return resources, err
}

func (r *Repository) GetChronicleResource(id uint) (ds.ChronicleResource, error) {
	var resource ds.ChronicleResource
	err := r.db.Where("id = ?", id).First(&resource).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ds.ChronicleResource{}, errors.New("chronicle resource not found")
		}
		return ds.ChronicleResource{}, err
	}
	return resource, nil
}

func (r *Repository) CreateChronicleResource(resource ds.ChronicleResource) (ds.ChronicleResource, error) {
	resource.ID = 0

	err := r.db.Create(&resource).Error
	if err != nil {
		return ds.ChronicleResource{}, err
	}
	return resource, nil
}

func (r *Repository) UpdateChronicleResource(id uint, resource ds.ChronicleResource) error {
	tx := r.db.Model(&ds.ChronicleResource{}).Where("id = ?", id).Updates(resource)
	if tx.Error != nil {
		return tx.Error
	}
	if tx.RowsAffected == 0 {
		return errors.New("chronicle resource not found")
	}
	return nil
}

// DeleteChronicleResource минус запись хроники и связанное изображение
func (r *Repository) DeleteChronicleResource(id uint) error {
	//  получаем запись чтобы узнать путь к изображению
	var resource ds.ChronicleResource
	err := r.db.Where("id = ?", id).First(&resource).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("chronicle resource not found")
		}
		return err
	}

	// миунс изображение из MinIO если оно есть
	if resource.Image != "" {
		ctx := context.Background()
		err = r.DeleteFileFromMinIO(ctx, resource.Image)
		if err != nil {
			// Логируем ошибку но не прерываем удаление записи
			fmt.Printf("Warning: failed to delete image from MinIO: %v\n", err)
		}
	}

	// минус запись из БД
	tx := r.db.Delete(&ds.ChronicleResource{}, id)
	if tx.Error != nil {
		return tx.Error
	}
	if tx.RowsAffected == 0 {
		return errors.New("chronicle resource not found")
	}
	return nil
}

func (r *Repository) UpdateChronicleResourceImage(id uint, imagePath string) error {
	tx := r.db.Model(&ds.ChronicleResource{}).Where("id = ?", id).Update("image", imagePath)
	if tx.Error != nil {
		return tx.Error
	}
	if tx.RowsAffected == 0 {
		return errors.New("chronicle resource not found")
	}
	return nil
}

func (r *Repository) UploadFileToMinIO(ctx context.Context, fileName string, fileReader io.Reader, fileSize int64, contentType string) error {
	_, err := r.minio.ListBuckets(ctx)
	if err != nil {
		return fmt.Errorf("MinIO is not accessible: %v", err)
	}

	_, err = r.minio.PutObject(ctx, r.bucket, fileName, fileReader, fileSize, minio.PutObjectOptions{
		ContentType: contentType,
	})
	return err
}

func (r *Repository) DeleteFileFromMinIO(ctx context.Context, fileName string) error {
	err := r.minio.RemoveObject(ctx, r.bucket, fileName, minio.RemoveObjectOptions{})
	if err != nil {
		return fmt.Errorf("failed to delete file from MinIO: %w", err)
	}
	return nil
}

// доп - генерирует имя файла изображения на латинице
func (r *Repository) GenerateImageFileName(originalName string) string {
	// расширение файла
	ext := ""
	if idx := strings.LastIndex(originalName, "."); idx != -1 {
		ext = originalName[idx:]
	}

	// уникальное имя на основе времени
	timestamp := time.Now().UnixNano()
	return fmt.Sprintf("chronicle_%d%s", timestamp, ext)
}
