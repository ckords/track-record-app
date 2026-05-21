-- Enable Row-Level Security on all tables
ALTER TABLE "Politician" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Vote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Promise" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FinanceRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Rating" ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables (anon and authenticated roles)
CREATE POLICY "public_read" ON "Politician"
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "public_read" ON "Vote"
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "public_read" ON "Promise"
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "public_read" ON "FinanceRecord"
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "public_read" ON "Rating"
  FOR SELECT TO anon, authenticated USING (true);

-- Rating: authenticated users can write and manage their own ratings
CREATE POLICY "auth_insert_own_rating" ON "Rating"
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "auth_update_own_rating" ON "Rating"
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = "userId");

CREATE POLICY "auth_delete_own_rating" ON "Rating"
  FOR DELETE TO authenticated
  USING (auth.uid()::text = "userId");
