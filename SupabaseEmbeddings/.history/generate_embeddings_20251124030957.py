from supabase import create_client, Client
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
import os

#load environment variables
load_dotenv()

#supabase credentials
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

#load embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")  

#fetch movies without embeddings
movies_resp = supabase.table("movies").select("id, review").is_("embedding", None).limit(500).execute()
movies = movies_resp.data
print(f"Fetched {len(movies)} rows to process")

#process each entry
for movie in movies:
    review = movie.get("review")
    if not review or review.strip() == "":
        print(f"Skipping id {movie['id']}: empty review")
        continue

    #generate embedding
    embedding = model.encode(review).tolist() 

    #update Supabase row
    update_resp = supabase.table("movies").update({"embedding": embedding}).eq("id", movie["id"]).execute()

    if update_resp.data is None or len(update_resp.data) == 0:
        print(f"Failed to update id {movie['id']}: {update_resp}")
    else:
        print(f"Successfully processed id {movie['id']}")
