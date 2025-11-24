
from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
import os

#load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app) 

#supabase credentials
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

print("Loading model...")
model = SentenceTransformer("all-MiniLM-L6-v2")
print("Model loaded!")

@app.route('/search', methods=['POST'])
def search():
    try:
        data = request.json
        query = data.get('query', '')
        
        if not query:
            return jsonify({'error': 'Query is required'}), 400
        
        print(f"\n{'='*50}")
        print(f"Search Query: {query}")
        
        #generate embedding for search query
        query_embedding = model.encode(query).tolist()
        
        # Try direct query first (for debugging)
        try:
            print(f"Testing direct vector query...")
            direct_result = supabase.from_('movies') \
                .select('id, review, sentiment') \
                .not_.is_('embedding', 'null') \
                .limit(5) \
                .execute()
            print(f"   Direct query returned {len(direct_result.data)} rows")
        except Exception as e:
            print(f"   Direct query failed: {e}")
        
        #search using RPC function
        print(f"Calling search_movies RPC function...")
        result = supabase.rpc(
            'search_movies',
            {
                'query_embedding': query_embedding,
                'match_threshold': 0.0,
                'match_count': 20
            }
        ).execute()
        
        return jsonify({
            'success': True,
            'results': result.data
        })
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'model': 'all-MiniLM-L6-v2'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
