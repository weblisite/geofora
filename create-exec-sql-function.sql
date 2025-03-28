-- Create a function to execute SQL code
-- This is a utility function for executing arbitrary SQL in Supabase
-- Warning: Use with caution as it can execute any SQL

-- Drop the function if it already exists
DROP FUNCTION IF EXISTS exec_sql(text);

-- Create the function
CREATE OR REPLACE FUNCTION exec_sql(query_text TEXT)
RETURNS SETOF json AS
$$
BEGIN
  RETURN QUERY EXECUTE query_text;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'SQL execution error: %', SQLERRM;
END;
$$
LANGUAGE plpgsql SECURITY DEFINER;