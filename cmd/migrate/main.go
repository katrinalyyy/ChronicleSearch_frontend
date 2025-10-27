package main

import (
	"Lab1/intermal/app/ds"
	"Lab1/intermal/app/dsn"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	_ = godotenv.Load()
	db, err := gorm.Open(postgres.Open(dsn.FromEnv()), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	// Мигрируем все таблицы
	err = db.AutoMigrate(
		&ds.User{},
		&ds.ChronicleResource{},
		&ds.RequestChronicleResearch{},
		&ds.ChronicleResearch{},
	)
	if err != nil {
		panic("cant migrate db")
	}
}
