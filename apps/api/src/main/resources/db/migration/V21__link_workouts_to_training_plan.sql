ALTER TABLE workout_record ADD COLUMN plan_id VARCHAR(64);
ALTER TABLE workout_record ADD CONSTRAINT fk_workout_plan FOREIGN KEY (plan_id) REFERENCES training_plan(id);
CREATE INDEX idx_workout_user_plan_time ON workout_record (user_id, plan_id, completed_at);
