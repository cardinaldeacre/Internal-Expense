package worker

import (
	"context"
	"encoding/json"
	"log"

	"github.com/hibiken/asynq"
)

func HandleEmailNotificationTask(ctx context.Context, t *asynq.Task) error {
	var p EmailNotificationPayload
	if err := json.Unmarshal(t.Payload(), &p); err != nil {
		return err
	}

	log.Printf("[BACKGROUND JOB] Processing email notification for ExpenseID: %s, UserID: %s, Status: %s", p.ExpenseID, p.UserID, p.Status)
	log.Printf("[BACKGROUND JOB] Sending email notification for ExpenseID: %s, UserID: %s, Status: %s", p.ExpenseID, p.UserID, p.Status)

	return nil
}
