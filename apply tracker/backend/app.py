from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import sqlite3
import csv
import io
from datetime import datetime

app = Flask(__name__)
CORS(app)

DB_PATH = "applytrack.db"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company TEXT NOT NULL,
            role TEXT NOT NULL,
            location TEXT,
            salary TEXT,
            status TEXT NOT NULL DEFAULT 'Applied',
            date_applied TEXT NOT NULL,
            deadline TEXT,
            notes TEXT,
            link TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)
    conn.commit()
    conn.close()

@app.route("/api/applications", methods=["GET"])
def get_applications():
    conn = get_db()
    rows = conn.execute("SELECT * FROM applications ORDER BY created_at DESC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route("/api/applications", methods=["POST"])
def create_application():
    data = request.json
    conn = get_db()
    cursor = conn.execute(
        """INSERT INTO applications (company, role, location, salary, status, date_applied, deadline, notes, link)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            data.get("company", ""),
            data.get("role", ""),
            data.get("location", ""),
            data.get("salary", ""),
            data.get("status", "Applied"),
            data.get("date_applied", datetime.today().strftime("%Y-%m-%d")),
            data.get("deadline", ""),
            data.get("notes", ""),
            data.get("link", ""),
        )
    )
    conn.commit()
    new_id = cursor.lastrowid
    row = conn.execute("SELECT * FROM applications WHERE id = ?", (new_id,)).fetchone()
    conn.close()
    return jsonify(dict(row)), 201

@app.route("/api/applications/<int:app_id>", methods=["PUT"])
def update_application(app_id):
    data = request.json
    conn = get_db()
    conn.execute(
        """UPDATE applications SET company=?, role=?, location=?, salary=?, status=?, date_applied=?, deadline=?, notes=?, link=?
           WHERE id=?""",
        (
            data.get("company", ""),
            data.get("role", ""),
            data.get("location", ""),
            data.get("salary", ""),
            data.get("status", "Applied"),
            data.get("date_applied", ""),
            data.get("deadline", ""),
            data.get("notes", ""),
            data.get("link", ""),
            app_id,
        )
    )
    conn.commit()
    row = conn.execute("SELECT * FROM applications WHERE id = ?", (app_id,)).fetchone()
    conn.close()
    return jsonify(dict(row))

@app.route("/api/applications/<int:app_id>", methods=["DELETE"])
def delete_application(app_id):
    conn = get_db()
    conn.execute("DELETE FROM applications WHERE id = ?", (app_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Deleted"})

@app.route("/api/export", methods=["GET"])
def export_csv():
    conn = get_db()
    rows = conn.execute("SELECT company, role, location, salary, status, date_applied, deadline, notes, link FROM applications ORDER BY created_at DESC").fetchall()
    conn.close()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Company", "Role", "Location", "Salary", "Status", "Date Applied", "Deadline", "Notes", "Link"])
    for row in rows:
        writer.writerow(list(row))
    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=applications.csv"}
    )

if __name__ == "__main__":
    init_db()
    print("ApplyTrack backend running on http://localhost:5000")
    app.run(debug=True, port=5000)
