#!/usr/bin/env python3

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import requests
import json
import os
import bcrypt
from base64 import b64encode
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv('config.env')

app = Flask(__name__)
CORS(app, origins=os.environ.get('ALLOWED_ORIGINS', '*').split(','))

# --- Config ---
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///users.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'dev-secret-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=8)

db = SQLAlchemy(app)
jwt = JWTManager(app)
limiter = Limiter(get_remote_address, app=app, default_limits=["200 per day", "50 per hour"], storage_uri="memory://")

# --- Jira Config (aus Umgebungsvariablen) ---
JIRA_CONFIG = {
    'base_url': os.environ.get('JIRA_BASE_URL', 'https://aymansoultana0305.atlassian.net'),
    'email': os.environ.get('JIRA_EMAIL', ''),
    'api_token': os.environ.get('JIRA_API_TOKEN', ''),
    'project_key': os.environ.get('JIRA_PROJECT_KEY', 'CRM')
}

MISTRAL_API_KEY = os.environ.get('MISTRAL_API_KEY', '')
MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions'


# --- Modelle ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)

    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))


with app.app_context():
    db.create_all()


# --- Auth Endpoints ---
@app.route('/auth/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'success': False, 'error': 'Email und Passwort erforderlich'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'success': False, 'error': 'Email bereits registriert'}), 409

    user = User(email=data['email'])
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({'success': True, 'token': token, 'email': user.email}), 201


@app.route('/auth/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'success': False, 'error': 'Email und Passwort erforderlich'}), 400

    user = User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({'success': False, 'error': 'Ungültige Anmeldedaten'}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({'success': True, 'token': token, 'email': user.email}), 200


@app.route('/auth/account', methods=['DELETE'])
@jwt_required()
def delete_account():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({'success': False, 'error': 'Nutzer nicht gefunden'}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Konto wurde gelöscht'}), 200


@app.route('/auth/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({'success': False, 'error': 'Nutzer nicht gefunden'}), 404
    return jsonify({'success': True, 'email': user.email, 'id': user.id}), 200


# --- Mistral LLM Endpoint ---
@app.route('/api/llm/chat', methods=['POST'])
@jwt_required()
def llm_chat():
    if not MISTRAL_API_KEY:
        return jsonify({'success': False, 'error': 'Mistral API Key nicht konfiguriert'}), 500

    data = request.get_json()
    if not data or not data.get('messages'):
        return jsonify({'success': False, 'error': 'Keine Nachrichten angegeben'}), 400

    model = data.get('model', 'mistral-small-latest')

    response = requests.post(
        MISTRAL_API_URL,
        headers={
            'Authorization': f'Bearer {MISTRAL_API_KEY}',
            'Content-Type': 'application/json'
        },
        json={
            'model': model,
            'messages': data['messages'],
            'max_tokens': data.get('max_tokens', 500),
            'temperature': data.get('temperature', 0.3)
        },
        timeout=30
    )

    if not response.ok:
        return jsonify({'success': False, 'error': f'Mistral API Fehler: {response.status_code}'}), 502

    return jsonify({'success': True, **response.json()}), 200


# --- Jira Endpoints (geschützt) ---
def sanitize_labels(labels):
    if not labels:
        return []
    sanitized = []
    for label in labels:
        if isinstance(label, str):
            clean_label = label.replace(' ', '-').replace('ä', 'ae').replace('ö', 'oe').replace('ü', 'ue').replace('ß', 'ss')
            clean_label = ''.join(c for c in clean_label if c.isalnum() or c in '-_')
            if clean_label:
                sanitized.append(clean_label)
    return sanitized


def create_jira_issue(config, issue_data):
    auth_string = f"{config['email']}:{config['api_token']}"
    auth_b64 = b64encode(auth_string.encode('ascii')).decode('ascii')
    headers = {
        'Authorization': f'Basic {auth_b64}',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
    jira_issue = {
        "fields": {
            "project": {"key": config['project_key']},
            "summary": issue_data['summary'],
            "description": issue_data['description'],
            "issuetype": {"name": issue_data.get('issue_type', 'Task')},
            "priority": {"name": issue_data.get('priority', 'Medium')},
            "labels": sanitize_labels(issue_data.get('labels', []))
        }
    }
    if 'bcf_reference' in issue_data:
        jira_issue['fields']['customfield_10000'] = issue_data['bcf_reference']

    for version in ['3', '2']:
        url = f"{config['base_url']}/rest/api/{version}/issue"
        try:
            response = requests.post(url, headers=headers, data=json.dumps(jira_issue), timeout=30)
            if response.status_code in [200, 201]:
                result = response.json()
                return {'success': True, 'issue_key': result['key'], 'issue_url': f"{config['base_url']}/browse/{result['key']}"}
            elif version == '2':
                error_data = response.json() if response.content else {}
                return {'success': False, 'error': f"HTTP {response.status_code}", 'details': error_data}
        except requests.exceptions.RequestException as e:
            if version == '2':
                return {'success': False, 'error': str(e)}

    return {'success': False, 'error': 'Alle API-Versionen fehlgeschlagen'}


@app.route('/api/jira/issue', methods=['POST'])
@jwt_required()
def create_issue():
    try:
        if not JIRA_CONFIG['email'] or not JIRA_CONFIG['api_token']:
            return jsonify({'success': False, 'error': 'Jira nicht konfiguriert'}), 400

        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'Keine Daten angegeben'}), 400

        issue_data = {
            'summary': data.get('summary', 'Issue from BIM Analysis'),
            'description': data.get('description', ''),
            'issue_type': data.get('issue_type', 'Task'),
            'priority': data.get('priority', 'Medium'),
            'labels': data.get('labels', []),
            'bcf_reference': data.get('bcf_reference')
        }

        result = create_jira_issue(JIRA_CONFIG, issue_data)
        return jsonify(result), 200 if result['success'] else 400

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/jira/config', methods=['GET'])
@jwt_required()
def get_config():
    return jsonify({
        'base_url': JIRA_CONFIG['base_url'],
        'project_key': JIRA_CONFIG['project_key'],
        'email_configured': bool(JIRA_CONFIG['email']),
        'token_configured': bool(JIRA_CONFIG['api_token'])
    })


# --- Health Check ---
@app.route('/health', methods=['GET'])
def health_check():
    from datetime import datetime
    return jsonify({'status': 'OK', 'service': 'BIM-Vision API', 'timestamp': datetime.now().isoformat()})


if __name__ == '__main__':
    print("Starting BIM-Vision Backend...")
    app.run(host='0.0.0.0', port=5001, debug=True)
