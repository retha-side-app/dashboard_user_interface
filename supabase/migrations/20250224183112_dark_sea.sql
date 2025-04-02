/*
  # Create courses table

  1. New Tables
    - `courses`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text)
      - `instructor_id` (uuid, references auth.users)
      - `image_url` (text)
      - `price` (numeric(10,2))
      - `duration` (interval)
      - `level` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `courses` table
    - Add policies for:
      - Anyone can read courses
      - Only instructors can create/update their own courses
*/

CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  instructor_id uuid REFERENCES auth.users(id),
  image_url text,
  price numeric(10,2) DEFAULT 0,
  duration interval,
  level text CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view courses
CREATE POLICY "Anyone can view courses"
  ON courses
  FOR SELECT
  TO public
  USING (true);

-- Policy: Instructors can create courses
CREATE POLICY "Instructors can create courses"
  ON courses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'instructor'
    )
  );

-- Policy: Instructors can update their own courses
CREATE POLICY "Instructors can update own courses"
  ON courses
  FOR UPDATE
  TO authenticated
  USING (instructor_id = auth.uid())
  WITH CHECK (instructor_id = auth.uid());