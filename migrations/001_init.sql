-- Core schema for Attendo

CREATE TABLE classes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')),
  time TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User-defined rate tiers (e.g. "Group Session", "1:1 Private") — replaces
-- the fixed junior/intermediate/senior columns from the dance-studio version.
-- Referenced by surrogate id (not name) so tiers can be renamed/repriced
-- without touching student rows, same pattern as classes.id below.
CREATE TABLE rate_tiers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  rate NUMERIC(6,2) NOT NULL CHECK (rate > 0),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  tier_id INTEGER NOT NULL REFERENCES rate_tiers(id),
  class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,
  parent_phone TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_students_tier_id ON students(tier_id);
CREATE INDEX idx_students_active ON students(active);

-- Single-row settings table (branding + PIN). Rates now live in rate_tiers.
CREATE TABLE settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  studio_name TEXT NOT NULL DEFAULT 'My Studio',
  currency_symbol TEXT NOT NULL DEFAULT '£',
  pin_hash TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO settings (id, studio_name, currency_symbol) VALUES (1, 'Kabir Badminton Services', '£');

INSERT INTO rate_tiers (name, rate, sort_order) VALUES
  ('Group Session', 6.00, 1),
  ('1:1 Private', 20.00, 2);

CREATE TABLE attendance_records (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,
  session_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, session_date)
);

CREATE INDEX idx_attendance_class_date ON attendance_records(class_id, session_date);
CREATE INDEX idx_attendance_student ON attendance_records(student_id);

CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  month CHAR(7) NOT NULL,
  paid BOOLEAN NOT NULL DEFAULT false,
  paid_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, month)
);

CREATE INDEX idx_payments_student ON payments(student_id);
CREATE INDEX idx_payments_paid ON payments(paid);
