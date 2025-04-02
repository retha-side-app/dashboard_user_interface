/*
  # Fix infinite recursion in users table policies

  This migration fixes the infinite recursion detected in the policy for the users table.
  The issue occurs when a policy references itself in a way that creates a circular dependency.
*/

-- First, drop any problematic policies on the users table
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create a new policy for viewing user data that avoids recursion
CREATE POLICY "Users can view own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Create a new policy for updating user data that avoids recursion
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);