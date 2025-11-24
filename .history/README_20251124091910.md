# Semantic Search Mobile Application

A cross-platform mobile application implementing AI-powered semantic search using local vector embeddings. Search through movie reviews using natural language queries that understand meaning and context, not just keywords.

---

## Introduction

Traditional keyword-based search systems often miss relevant results because they cannot understand the semantic meaning of queries. This project demonstrates how semantic search solves this problem by converting text into vector embeddings and performing similarity searches based on meaning.

The application uses a completely free, local embedding model (all-MiniLM-L6-v2) instead of paid API services like OpenAI or Google Gemini, making it cost-effective while maintaining strong performance. Built with React Native for the frontend and Flask for the backend, it provides a real-world example of integrating AI/ML capabilities into mobile applications.

**Target Audience:** Developers learning about semantic search, vector embeddings, or mobile app development with AI integration.

---

## Features

- Semantic search based on meaning rather than keywords
- Cross-platform mobile application (iOS and Android)
- Real-time search with ranked results by similarity score
- Sentiment analysis visualization with color-coded badges
- Local AI embedding model (zero API costs)
- RESTful Flask API backend
- Vector similarity search using PostgreSQL pgvector extension
- Clean, responsive mobile UI with loading states

---

## Tech Stack

**Frontend:**
- React Native with TypeScript
- Expo Framework
- React Hooks for state management
- Expo Constants for environment variables

**Backend:**
- Python 3.8+
- Flask REST API
- Flask-CORS for cross-origin requests
- Sentence Transformers (all-MiniLM-L6-v2 model)

**Database:**
- Supabase (PostgreSQL)
- pgvector extension for vector operations
- IVFFlat indexing for fast similarity search

**AI/ML:**
- all-MiniLM-L6-v2 embedding model
- 384-dimensional vector embeddings
- Cosine similarity for semantic matching

---

## Project Structure

```
semantic-search-mobile-app/
│
├── backend/
│   ├── app.py                    # Flask API server
│   ├── generate_embeddings.py    # Script to generate embeddings
│   ├── requirements.txt          # Python dependencies
│   ├── .env                      # Environment variables (not in git)
│   └── .env.example              # Example environment file
│
├── semantic-search-app/          # React Native client
│   ├── App.tsx                   # Main application component
│   ├── app.config.js             # Expo configuration with env vars
│   ├── package.json              # Node.js dependencies
│   ├── tsconfig.json             # TypeScript configuration
│   └── assets/                   # Images and static files
│
├── .gitignore                    # Git ignore rules
├── .env.example                  # Example environment variables
└── README.md                     # This file
```

---

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download](https://www.python.org/)
- **Git** - [Download](https://git-scm.com/)
- **Expo CLI** - Install with `npm install -g expo-cli`
- **Supabase Account** - [Sign up](https://supabase.com) (free tier available)
- **Code Editor** - VS Code recommended

---

## How to Run This Project

### Step 1: Setting up React Native Project

**1.1. Clone the repository:**

```bash
git clone https://github.com/YOUR_USERNAME/semantic-search-mobile-app.git
cd semantic-search-mobile-app
```

**1.2. Navigate to client directory:**

```bash
cd semantic-search-app
```

**1.3. Install dependencies:**

```bash
npm install
```

**1.4. Install Expo Constants:**

```bash
npx expo install expo-constants
```

---

### Step 2: Setting up Supabase Account

**2.1. Create a Supabase project:**

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Enter project name (e.g., "semantic-db")
5. Create a strong database password and save it
6. Select a region close to your location
7. Wait 2-3 minutes for project setup

**2.2. Get your API credentials:**

1. Go to Project Settings → API
2. Copy your **Project URL** (looks like `https://xxxxx.supabase.co`)
3. Copy your **service_role key** (secret key, not anon key)

**2.3. Enable pgvector extension:**

Go to SQL Editor in Supabase dashboard and run:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

---

### Step 3: Finding and Preparing Dataset

**3.1. Download dataset:**

1. Visit [kaggle.com](https://kaggle.com)
2. Search for movie reviews or sentiment analysis datasets
3. Download a dataset with columns: `review` (text) and `sentiment` (positive/negative)
4. Example: "IMDB Movie Reviews" or "Rotten Tomatoes Reviews"

**3.2. Clean the data:**

Using Excel, Google Sheets, or Python:
- Remove rows with empty reviews
- Remove special characters that might cause issues
- Ensure sentiment column has consistent values (positive/negative)
- Limit to 150-500 rows for initial testing
- Save as CSV with columns: `review`, `sentiment`

**Note:** If your dataset has different column names, update the SQL queries and Python scripts accordingly.

---

### Step 4: Creating SQL Table on Supabase

Go to **SQL Editor** in Supabase and run:

```sql
-- Create the movies table
CREATE TABLE movies (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  review TEXT NOT NULL,
  sentiment TEXT,
  embedding VECTOR(384)
);

-- Create index for fast similarity search
CREATE INDEX ON movies USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Create search function
CREATE OR REPLACE FUNCTION search_movies (
  query_embedding VECTOR(384),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id BIGINT,
  review TEXT,
  sentiment TEXT,
  similarity FLOAT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    movies.id,
    movies.review,
    movies.sentiment,
    1 - (movies.embedding <=> query_embedding) AS similarity
  FROM movies
  WHERE 1 - (movies.embedding <=> query_embedding) > match_threshold
  ORDER BY movies.embedding <=> query_embedding
  LIMIT match_count;
$$;
```

---

### Step 5: Uploading Data to Supabase

**Option A: Using Supabase Dashboard (Easier)**

1. Go to **Table Editor** → **movies** table
2. Click "Insert" → "Import data from CSV"
3. Upload your cleaned CSV file
4. Map columns: `review` → review, `sentiment` → sentiment
5. Leave `embedding` column empty (will be generated later)
6. Click "Import"

**Option B: Using SQL (For larger datasets)**

```sql
INSERT INTO movies (review, sentiment) VALUES
('Great movie with excellent acting!', 'positive'),
('Terrible waste of time.', 'negative');
-- Add more rows as needed
```

---

### Step 6: Server Setup

**6.1. Navigate to backend directory:**

```bash
cd ../backend
```

**6.2. Create virtual environment (recommended):**

```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

**6.3. Install dependencies:**

```bash
pip install -r requirements.txt
```

If `requirements.txt` doesn't exist, create it with:

```
flask==3.0.0
flask-cors==4.0.0
supabase==2.3.0
sentence-transformers==2.2.2
torch==2.1.0
python-dotenv==1.0.0
```

Then run: `pip install -r requirements.txt`

**6.4. Configure environment variables:**

Create `backend/.env` file:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

Replace with your actual Supabase credentials from Step 2.2.

---

### Step 7: Generate Embeddings

**7.1. Run the embedding generation script:**

```bash
python generate_embeddings.py
```

This script uses the **all-MiniLM-L6-v2** local embedding model to convert each review into a 384-dimensional vector. The model is:
- Completely free and open-source
- Runs locally (no API calls)
- Developed by Microsoft/Sentence-Transformers
- Produces high-quality embeddings for semantic search

**Process:**
- Downloads model on first run (~80MB)
- Processes 50-100 reviews at a time
- Takes 2-3 minutes for 150 reviews
- Updates the `embedding` column in Supabase

**7.2. Verify embeddings were created:**

In Supabase SQL Editor, run:

```sql
SELECT COUNT(*) FROM movies WHERE embedding IS NOT NULL;
```

Should return the number of rows you uploaded.

---

### Step 8: Run the Server

**8.1. Start Flask server:**

```bash
python app.py
```

You should see:

```
Loading model...
Model loaded successfully!
* Running on http://0.0.0.0:5000
```

**8.2. Test the server:**

Open browser or Postman and visit: `http://localhost:5000/health`

Should return:
```json
{
  "status": "healthy",
  "model": "all-MiniLM-L6-v2"
}
```

Keep this terminal running.

---

### Step 9: Client Setup

**9.1. Find your local IP address:**

**On Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., `192.168.1.5`)

**On macOS/Linux:**
```bash
ifconfig | grep "inet "
```
or
```bash
ip addr show
```

**9.2. Configure client environment:**

In project root, create `.env` file:

```env
BACKEND_URL=http://YOUR_LOCAL_IP:5000
```

Replace `YOUR_LOCAL_IP` with the IP address from Step 9.1 (e.g., `http://192.168.1.5:5000`)

**9.3. Update app.config.js:**

Ensure `semantic-search-app/app.config.js` exists with:

```javascript
export default {
  expo: {
    name: "semantic-search-app",
    slug: "semantic-search-app",
    version: "1.0.0",
    orientation: "portrait",
    extra: {
      backendUrl: process.env.BACKEND_URL 
    }
  }
};
```

---

### Step 10: Run the Client

**10.1. Navigate to client directory:**

```bash
cd ../semantic-search-app
```

**10.2. Start Expo development server:**

```bash
npx expo start
```

or with cache clearing:

```bash
npx expo start --clear
```

**10.3. Run on device:**

**Option A: Physical Device**
1. Install "Expo Go" app from App Store or Google Play
2. Scan the QR code shown in terminal
3. Wait for app to load

**Option B: Emulator/Simulator**
- Press `i` for iOS Simulator (Mac only)
- Press `a` for Android Emulator (requires Android Studio)

---

### Step 11: Query from Frontend

**11.1. Test the search:**

Try these queries:
- "wonderful production with great acting"
- "terrible movie waste of time"
- "exciting action scenes"
- "romantic love story"
- "funny comedy"

**11.2. Understanding results:**

- Results are ranked by similarity score (0-1)
- Higher scores mean better semantic matches
- Sentiment badges show positive (green) or negative (red)
- Results update in real-time as you search

**11.3. Adjust search sensitivity:**

In `backend/app.py`, modify `match_threshold`:
- `0.15` - More results, lower quality
- `0.20` - Balanced (default)
- `0.25` - Fewer results, higher quality
- `0.30` - Very strict matching

---

## API Documentation

### Base URL

```
http://YOUR_LOCAL_IP:5000
```

### Endpoints

#### 1. Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "model": "all-MiniLM-L6-v2"
}
```

#### 2. Search

```http
POST /search
Content-Type: application/json
```

**Request Body:**
```json
{
  "query": "wonderful production with great acting"
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": 1,
      "review": "A wonderful little production. The filming technique...",
      "sentiment": "positive",
      "similarity": 0.847
    },
    {
      "id": 23,
      "review": "Great acting and terrific production quality...",
      "sentiment": "positive",
      "similarity": 0.762
    }
  ]
}
```

---

## Troubleshooting

### Server Issues

**Problem: Module not found error**

Solution:
```bash
pip install -r requirements.txt
```

### Database Issues

**Problem: Vector dimension mismatch**

Solution:
```sql
-- Check current dimension
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'movies' AND column_name = 'embedding';

-- If wrong, recreate column
ALTER TABLE movies DROP COLUMN embedding;
ALTER TABLE movies ADD COLUMN embedding VECTOR(384);
```

---

## How It Works

### 1. Embedding Generation

Text is converted to numerical vectors that capture semantic meaning:

```python
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("all-MiniLM-L6-v2")
embedding = model.encode("wonderful production")  # Returns 384-dimensional vector
```

### 2. Vector Storage

Embeddings are stored in PostgreSQL with pgvector extension, which supports efficient vector operations.

### 3. Similarity Search

When searching:
1. User query is converted to embedding vector
2. Cosine similarity computed against all stored vectors
3. Results ranked by similarity score
4. Top matches returned to user

### 4. Similarity Scoring

```
Similarity = 1 - cosine_distance(query_vector, stored_vector)
```

- 1.0 = Identical
- 0.8-0.9 = Very similar
- 0.6-0.8 = Similar
- 0.4-0.6 = Somewhat similar
- Below 0.4 = Different

---

## License

This project is licensed under the MIT License.

---


## Contact

For questions or issues, please open an issue on GitHub.

---
