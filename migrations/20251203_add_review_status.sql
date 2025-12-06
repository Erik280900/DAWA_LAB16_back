-- Migration: add 'review' to tasks.status enum
-- Run this in your MySQL client connected to the project's database.
-- It will modify the `status` column to include the 'review' value.

ALTER TABLE tasks
  MODIFY COLUMN status ENUM('pending','in_progress','review','completed') DEFAULT 'pending';
