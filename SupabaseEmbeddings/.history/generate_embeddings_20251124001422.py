from supabase import create_client, Client
from sentence_transformers import SentenceTransformer

# 1️⃣ Supabase credentials
SUPABASE_URL = "https://wpsplxfybiygwtncgoiq.supabase.co"  # replace with your URL
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indwc3BseGZ5Yml5Z3d0bmNnb2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxNTY4OCwiZXhwIjoyMDc5NDkxNjg4fQ.bQT6V70Dvu9TQPSSmdoWP0M3I2Gvf7CYng2DR8LpUJk"            # replace with your service role key

# 2️⃣ Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 3️⃣ Load embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")  # small, fast, 384 dims

# 4️⃣ Fetch movies without embeddings
movies_resp = supabase.table("movies").select("id, review").is_("embedding", None).limit(50).execute()
movies = movies_resp.data
print(f"Fetched {len(movies)} rows to process")

# 5️⃣ Process each movie
for movie in movies:
    review = movie.get("review")
    if not review or review.strip() == "":
        print(f"Skipping id {movie['id']}: empty review")
        continue

    # Generate embedding
    embedding = model.encode(review).tolist()  # convert to list for JSON/DB

    # Update Supabase row
    update_resp = supabase.table("movies").update({"embedding": embedding}).eq("id", movie["id"]).execute()

    # Check for errors
    if update_resp.status_code != 200:
        print(f"Failed to update id {movie['id']}: {update_resp.data}")
    else:
        print(f"Successfully processed id {movie['id']}")

