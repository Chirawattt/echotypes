CREATE OR REPLACE FUNCTION get_random_words(
    p_level TEXT,
    p_limit INT
)
RETURNS SETOF "Words" AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM "Words"
    WHERE level = p_level
    ORDER BY random()
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;