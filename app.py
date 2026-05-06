from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
import os
import json
import webbrowser
import threading
from datetime import datetime

app = Flask(__name__, static_url_path='/static', static_folder='static')
CORS(app)

# Database Configuration
# For Vercel: Set MYSQL_URL environment variable
# Format: mysql+pymysql://user:password@host/dbname
# Local Fallback: SQLite
db_url = os.environ.get('MYSQL_URL')
if not db_url:
    if os.environ.get('VERCEL'):
        # On Vercel, the only writable directory is /tmp
        db_url = 'sqlite:////tmp/local.db'
    else:
        # Local development
        db_url = 'sqlite:///' + os.path.join(os.getcwd(), 'local.db')

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- MODELS ---

class Menu(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    cat = db.Column(db.String(50), nullable=False)
    img = db.Column(db.String(500))
    tags = db.Column(db.JSON) # MySQL/PostgreSQL support JSON, SQLite handles it as string

class Order(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    time = db.Column(db.String(100))
    total = db.Column(db.Integer)
    paymentMethod = db.Column(db.String(50))
    items = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Stat(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(50), unique=True, nullable=False)
    value = db.Column(db.Integer, default=0)

class ActivityLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    msg = db.Column(db.String(500))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# --- INITIALIZATION ---

def init_db():
    try:
        with app.app_context():
            db.create_all()
            
            # Initialize stats if empty
            if not Stat.query.filter_by(key='bookings').first():
                db.session.add(Stat(key='bookings', value=0))
            if not Stat.query.filter_by(key='orders').first():
                db.session.add(Stat(key='orders', value=0))
            if not Stat.query.filter_by(key='revenue').first():
                db.session.add(Stat(key='revenue', value=0))
            
            # Initialize menu if empty
            if Menu.query.count() == 0:
                print("Initializing Menu items...")
                default_menu = [
                    { "id": 1, "name": "Flat White", "price": 250, "cat": "coffee", "img": "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=600", "tags": [] },
                    { "id": 2, "name": "Cappuccino", "price": 250, "cat": "coffee", "img": "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=600", "tags": [] },
                    { "id": 3, "name": "Cafe Latte", "price": 250, "cat": "coffee", "img": "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?auto=format&fit=crop&q=80&w=600", "tags": [] },
                    { "id": 4, "name": "Mocha", "price": 270, "cat": "coffee", "img": "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&q=80&w=600", "tags": [] },
                    { "id": 5, "name": "Long Black", "price": 230, "cat": "coffee", "img": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=600", "tags": ["sugar-free"] },
                    { "id": 6, "name": "Espresso", "price": 140, "cat": "coffee", "img": "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?auto=format&fit=crop&q=80&w=600", "tags": ["sugar-free"] },
                    { "id": 7, "name": "Piccolo Latte", "price": 200, "cat": "coffee", "img": "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&q=80&w=600", "tags": [] },
                    { "id": 8, "name": "Alkaline Smoothie", "price": 390, "cat": "smoothies", "img": "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&q=80&w=600", "tags": ["wholefood", "sugar-free"] },
                    { "id": 9, "name": "Nourish Smoothie", "price": 390, "cat": "smoothies", "img": "https://images.unsplash.com/photo-1594498653385-d5172c532c00?auto=format&fit=crop&q=80&w=600", "tags": ["vegan", "wholefood", "sugar-free"] },
                    { "id": 10, "name": "Berry Nice To Meet You", "price": 390, "cat": "smoothies", "img": "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&q=80&w=600", "tags": ["wholefood", "sugar-free"] },
                    { "id": 11, "name": "PBC Protein Smoothie", "price": 390, "cat": "smoothies", "img": "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&q=80&w=600", "tags": ["protein", "sugar-free"] },
                    { "id": 12, "name": "Invigorate", "price": 390, "cat": "smoothies", "img": "https://images.unsplash.com/photo-1594498653385-d5172c532c00?auto=format&fit=crop&q=80&w=600", "tags": ["protein", "sugar-free"] },
                    { "id": 13, "name": "Infinity Cold Coffee", "price": 300, "cat": "cold", "img": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=600", "tags": [] },
                    { "id": 14, "name": "Cold Brew Coffee", "price": 250, "cat": "cold", "img": "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=600", "tags": ["sugar-free"] },
                    { "id": 15, "name": "Iced Latte", "price": 275, "cat": "cold", "img": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=600", "tags": [] },
                    { "id": 16, "name": "Affogato", "price": 320, "cat": "cold", "img": "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=600", "tags": [] },
                    { "id": 17, "name": "Matcha Latte", "price": 330, "cat": "wellness", "img": "https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&q=80&w=600", "tags": [] },
                    { "id": 18, "name": "Golden Latte", "price": 250, "cat": "wellness", "img": "https://images.unsplash.com/photo-1515443961218-a51367888e4b?auto=format&fit=crop&q=80&w=600", "tags": [] },
                    { "id": 19, "name": "Hot Chocolate", "price": 230, "cat": "wellness", "img": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=600", "tags": [] },
                    { "id": 20, "name": "Tropical Juice", "price": 330, "cat": "wellness", "img": "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&q=80&w=600", "tags": ["sugar-free"] },
                    { "id": 21, "name": "Cleanse Juice", "price": 330, "cat": "wellness", "img": "https://images.unsplash.com/photo-1594498653385-d5172c532c00?auto=format&fit=crop&q=80&w=600", "tags": ["sugar-free"] },
                    { "id": 22, "name": "Kashmiri Kahwa", "price": 275, "cat": "wellness", "img": "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=600", "tags": [] },
                    { "id": 23, "name": "Indian Summer", "price": 220, "cat": "wellness", "img": "https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&q=80&w=600", "tags": [] },
                    { "id": 24, "name": "One O Eight Kefir", "price": 330, "cat": "wellness", "img": "https://images.unsplash.com/photo-1515443961218-a51367888e4b?auto=format&fit=crop&q=80&w=600", "tags": [] }
                ]
                for item in default_menu:
                    db.session.add(Menu(id=item['id'], name=item['name'], price=item['price'], cat=item['cat'], img=item['img'], tags=item['tags']))
            
            db.session.commit()
    except Exception as e:
        print(f"Database Initialization Error: {e}")

init_db()

# --- ROUTES ---

@app.route('/')
def index():
    return send_from_directory(os.getcwd(), 'index.html')

@app.route('/admin')
def serve_admin():
    return send_from_directory(os.getcwd(), 'admin.html')

@app.route('/api/data', methods=['GET'])
def get_data():
    try:
        # Get Stats
        stats = {s.key: s.value for s in Stat.query.all()}
        
        # Get Activity
        activity = [a.msg for a in ActivityLog.query.order_by(ActivityLog.timestamp.desc()).limit(20).all()]
        
        # Get Orders
        orders = []
        for o in Order.query.order_by(Order.created_at.desc()).all():
             orders.append({
                 "id": o.id,
                 "time": o.time,
                 "total": o.total,
                 "paymentMethod": o.paymentMethod,
                 "items": o.items
             })
        # Note: SQLAlchemy query results need manual sorting or proper field for timestamp
        
        # Get Menu
        menu = []
        for m in Menu.query.all():
            menu.append({
                "id": m.id,
                "name": m.name,
                "price": m.price,
                "cat": m.cat,
                "img": m.img,
                "tags": m.tags
            })
            
        return jsonify({
            "stats": stats,
            "activity": activity,
            "orders": orders,
            "menu": menu
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/data', methods=['POST'])
def update_data():
    try:
        data = request.json
        
        # Sync Stats
        if 'stats' in data:
            for key, val in data['stats'].items():
                stat = Stat.query.filter_by(key=key).first()
                if stat:
                    stat.value = val
                else:
                    db.session.add(Stat(key=key, value=val))
        
        # Sync Activity (Usually we append new ones)
        if 'activity' in data:
            # For simplicity, we'll just add the first one if it's new
            # but usually the frontend sends the whole list.
            # We'll just clear and rewrite for now to match the frontend's expectation
            # WARNING: This is inefficient but matches the current frontend logic
            ActivityLog.query.delete()
            for msg in data['activity'][:50]: # Limit to last 50
                db.session.add(ActivityLog(msg=msg))
        
        # Sync Orders
        if 'orders' in data:
            # Clear and rewrite or update. Since it's a small app, we'll sync.
            for order_data in data['orders']:
                existing = Order.query.filter_by(id=order_data['id']).first()
                if not existing:
                    db.session.add(Order(
                        id=order_data['id'],
                        time=order_data['time'],
                        total=order_data['total'],
                        paymentMethod=order_data['paymentMethod'],
                        items=order_data['items']
                    ))
        
        # Sync Menu
        if 'menu' in data:
            for m_data in data['menu']:
                item = Menu.query.get(m_data['id'])
                if item:
                    item.name = m_data['name']
                    item.price = m_data['price']
                    item.cat = m_data['cat']
                    item.img = m_data['img']
                    item.tags = m_data['tags']
                else:
                    db.session.add(Menu(
                        id=m_data['id'],
                        name=m_data['name'],
                        price=m_data['price'],
                        cat=m_data['cat'],
                        img=m_data['img'],
                        tags=m_data['tags']
                    ))

        db.session.commit()
        return jsonify({"status": "success", "message": "SQL Database Synced"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

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
        UPLOAD_FOLDER = os.path.join(os.getcwd(), 'static', 'uploads')
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        file.save(os.path.join(UPLOAD_FOLDER, filename))
        return jsonify({"url": f"/static/uploads/{filename}"})

@app.route('/<path:path>')
def serve_static(path):
    root_dir = os.getcwd()
    if os.path.exists(os.path.join(root_dir, path)):
        return send_from_directory(root_dir, path)
    return send_from_directory(os.path.join(root_dir, 'static'), path)

if __name__ == '__main__':
    print("Starting Cafe Backend Server with MySQL/SQLAlchemy...")
    if os.environ.get('VERCEL') is None:
        threading.Timer(1.25, lambda: webbrowser.open('http://127.0.0.1:5000/')).start()
    app.run(debug=True, port=5000)
