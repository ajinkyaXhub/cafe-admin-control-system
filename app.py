from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import json
import webbrowser
import threading

app = Flask(__name__, static_url_path='/static', static_folder='static')
CORS(app)
root_dir = os.getcwd()
UPLOAD_FOLDER = os.path.join(root_dir, 'static', 'uploads')
DATA_FILE = os.path.join(root_dir, 'db.json')

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize DB if not exists
def init_db():
    if not os.path.exists(DATA_FILE) or os.path.getsize(DATA_FILE) == 0:
        default_data = {
            "stats": {"bookings": 0, "orders": 0, "revenue": 0},
            "activity": ["Server initialized"],
            "orders": [],
            "menu": [] 
        }
        with open(DATA_FILE, 'w') as f:
            json.dump(default_data, f, indent=4)

init_db()

def get_db():
    try:
        if not os.path.exists(DATA_FILE) or os.path.getsize(DATA_FILE) == 0:
            init_db()
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    except json.JSONDecodeError:
        # If corrupted, reset
        init_db()
        with open(DATA_FILE, 'r') as f:
            return json.load(f)

def save_db(data):
    try:
        with open(DATA_FILE, 'w') as f:
            json.dump(data, f, indent=4)
        return True
    except Exception as e:
        print(f"Error saving to DB: {e}")
        # On Vercel, this will fail. We could use /tmp/db.json as a fallback
        # but it will be wiped on every cold start.
        return False

@app.route('/')
def index():
    return send_from_directory(root_dir, 'index.html')

@app.route('/admin')
def serve_admin():
    return send_from_directory(root_dir, 'admin.html')

@app.route('/api/data', methods=['GET'])
def get_data():
    return jsonify(get_db())

@app.route('/api/data', methods=['POST'])
def update_data():
    data = request.json
    success = save_db(data)
    return jsonify({"status": "success" if success else "error", "message": "Data updated" if success else "Database is read-only (e.g. on Vercel)"})

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'image' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file:
        filename = secure_filename(file.filename)
        # Add timestamp to filename to avoid collisions
        name, ext = os.path.splitext(filename)
        filename = f"{name}_{int(threading.main_thread().ident)}{ext}"
        file.save(os.path.join(UPLOAD_FOLDER, filename))
        return jsonify({"url": f"/static/uploads/{filename}"})

@app.route('/<path:path>')
def serve_static(path):
    # Try serving from root first (for html/js/css/etc in project root)
    if os.path.exists(os.path.join(root_dir, path)):
        return send_from_directory(root_dir, path)
    # Fallback to static folder
    return send_from_directory(os.path.join(root_dir, 'static'), path)

if __name__ == '__main__':
    print("Starting Cafe Backend Server with JSON DB...")
    print("Live Site: http://127.0.0.1:5000/")
    print("Admin Site: http://127.0.0.1:5000/admin")
    
    if os.environ.get('VERCEL') is None:
        threading.Timer(1.25, lambda: webbrowser.open('http://127.0.0.1:5000/')).start()
    
    app.run(debug=True, port=5000)
