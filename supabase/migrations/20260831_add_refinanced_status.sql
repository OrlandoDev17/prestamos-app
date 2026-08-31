-- Agregar valor "refinanced" al CHECK constraint de status en loans
-- Ejecutar en Supabase SQL Editor

ALTER TABLE loans DROP CONSTRAINT loans_status_check;

ALTER TABLE loans ADD CONSTRAINT loans_status_check CHECK (status IN ('active', 'paid', 'refinanced'));
