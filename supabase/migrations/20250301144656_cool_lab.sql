/*
  # Add last viewed steps table

  1. New Tables
    - `last_viewed_steps`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `course_id` (uuid, references courses)
      - `step_id` (uuid, references course_steps)
      - `week_id` (uuid, references course_weeks)
      - `day_id` (uuid, references course_days)
      - `viewed_at` (timestamptz)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on `last_viewed_steps` table
    - Add policies for authenticated users to manage their own data
*/

-- Create the last_viewed_steps table
CREATE TABLE IF NOT EXISTS last_viewed_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  course_id uuid REFERENCES courses(id) NOT NULL,
  step_id uuid REFERENCES course_steps(id) NOT NULL,
  week_id uuid REFERENCES course_weeks(id) NOT NULL,
  day_id uuid REFERENCES course_days(id) NOT NULL,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_last_viewed_steps_user_course
ON last_viewed_steps(user_id, course_id);

-- Enable Row Level Security
ALTER TABLE last_viewed_steps ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own last viewed steps"
ON last_viewed_steps
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own last viewed steps"
ON last_viewed_steps
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own last viewed steps"
ON last_viewed_steps
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own last viewed steps"
ON last_viewed_steps
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);