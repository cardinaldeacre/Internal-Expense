package worker

import (
	"encoding/json"

	"github.com/hibiken/asynq"
)

const TypeEmailNotification = "email:notification"

type EmailNotificationPayload struct {
	ExpenseID string
	UserID    string
	Status    string
}

func NewEmailNotificationTask(expenseID, userID, status string) (*asynq.Task, error) {
	payload, err := json.Marshal(EmailNotificationPayload{
		ExpenseID: expenseID,
		UserID:    userID,
		Status:    status,
	})
	if err != nil {
		return nil, err
	}

	return asynq.NewTask(TypeEmailNotification, payload, asynq.MaxRetry(3)), nil
}
