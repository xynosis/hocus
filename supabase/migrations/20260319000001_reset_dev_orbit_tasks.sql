-- Reset tasks left in orbit/in_progress by dev testing tool
UPDATE tasks SET status = 'todo', updated_at = NOW() WHERE status IN ('orbit', 'in_progress');
