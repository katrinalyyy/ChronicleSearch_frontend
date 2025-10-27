package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Repository struct {
	db     *gorm.DB
	minio  *minio.Client
	bucket string
}

func New(dsn string, minioEndpoint, minioAccessKey, minioSecretKey, bucket string, useSSL bool) (*Repository, error) {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	minioClient, err := minio.New(minioEndpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(minioAccessKey, minioSecretKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create MinIO client: %v", err)
	}

	ctx := context.Background()
	exists, err := minioClient.BucketExists(ctx, bucket)
	if err != nil {
		return nil, fmt.Errorf("failed to check bucket existence: %v", err)
	}
	if !exists {
		err = minioClient.MakeBucket(ctx, bucket, minio.MakeBucketOptions{})
		if err != nil {
			return nil, fmt.Errorf("failed to create bucket: %v", err)
		}
	}

	// Redis будет добавлен позже по методичке

	return &Repository{
		db:     db,
		minio:  minioClient,
		bucket: bucket,
	}, nil
}

// возвращает зафиксированный UUID создателя (для обратной совместимости со старым кодом)
// В реальном приложении UUID должен браться из JWT токена
func GetFixedCreatorID() uuid.UUID {
	// Возвращаем nil UUID - в реальном коде это должно браться из контекста
	return uuid.Nil
}

// возвращает зафиксированный UUID модератора (для обратной совместимости со старым кодом)
// В реальном приложении UUID должен браться из JWT токена
func GetFixedModeratorID() uuid.UUID {
	// Возвращаем nil UUID - в реальном коде это должно браться из контекста
	return uuid.Nil
}

func (r *Repository) ResetSequences() error {
	err := r.db.Exec("SELECT setval('chronicle_resources_id_seq', COALESCE((SELECT MAX(id) FROM chronicle_resources), 1))").Error
	if err != nil {
		return err
	}

	err = r.db.Exec("SELECT setval('request_chronicle_researches_id_seq', COALESCE((SELECT MAX(id) FROM request_chronicle_researches), 1))").Error
	if err != nil {
		return err
	}

	err = r.db.Exec("SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1))").Error
	return err
}
