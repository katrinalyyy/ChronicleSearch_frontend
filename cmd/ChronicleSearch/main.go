package main

import (
	"Lab1/intermal/app/config"
	"Lab1/intermal/app/dsn"
	"Lab1/intermal/app/handler"
	"Lab1/intermal/app/redis"
	"Lab1/intermal/app/repository"
	"Lab1/intermal/pkg"
	"context"

	_ "Lab1/docs" // swagger docs

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// @title ChronicleSearch API
// @version 1.0
// @description REST API для системы поиска и управления историческими хрониками

// @contact.name API Support
// @contact.email support@chroniclesearch.ru

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8080
// @BasePath /

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Введите токен в формате: Bearer {токен}

func main() {
	router := gin.Default()

	conf, err := config.NewConfig()
	if err != nil {
		logrus.Fatalf("error loading config: %v", err)
	}

	postgresString := dsn.FromEnv()
	logrus.Info("Connecting to database...")

	rep, errRep := repository.New(
		postgresString,
		conf.MinIO.Endpoint,
		conf.MinIO.AccessKeyID,
		conf.MinIO.SecretAccessKey,
		conf.MinIO.BucketName,
		conf.MinIO.UseSSL,
	)
	if errRep != nil {
		logrus.Fatalf("error initializing repository: %v", errRep)
	}

	if err := rep.ResetSequences(); err != nil {
		logrus.Warnf("failed to reset sequences: %v", err)
	}

	redisClient, err := redis.New(context.Background(), conf.Redis)
	if err != nil {
		logrus.Fatalf("error initializing redis: %v", err)
	}
	logrus.Info("Redis connected successfully")

	application := pkg.NewApp(conf, router, nil, redisClient)
	hand := handler.NewHandler(rep, conf, redisClient, application)
	application.Handler = hand
	application.RunApp()
}
