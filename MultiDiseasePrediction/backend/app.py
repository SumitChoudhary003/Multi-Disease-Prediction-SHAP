"""
Multi-Disease Risk Prediction System - Flask Backend
Supports: Diabetes, Heart Disease, Chronic Kidney Disease
With SHAP Explainability
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash
import pickle, os, datetime, numpy as np, pandas as pd
import shap, json, base64, io, matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

# ─── App Setup ────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app, 
     supports_credentials=True,
     resources={r"/api/*": {"origins": ["http://localhost:3000,"
     "https://multi-disease-prediction-shap-2.onrender.com"]}}
    )

app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['JWT_SECRET_KEY'] = 'jwt-secret-change-in-production'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(days=7)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///medical_app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db  = SQLAlchemy(app)
with app.app_context():
    db.create_all()
jwt = JWTManager(app)

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')

# ─── Database Models ──────────────────────────────────────────────────────────
class User(db.Model):
    id           = db.Column(db.Integer, primary_key=True)
    name         = db.Column(db.String(120), nullable=False)
    email        = db.Column(db.String(120), unique=True, nullable=False)
    password     = db.Column(db.String(256), nullable=False)
    created_at   = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    predictions  = db.relationship('Prediction', backref='user', lazy=True)

class Prediction(db.Model):
    id           = db.Column(db.Integer, primary_key=True)
    user_id      = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    disease      = db.Column(db.String(50), nullable=False)       # diabetes / heart / kidney / combined
    input_data   = db.Column(db.Text)
    result       = db.Column(db.Text)
    risk_level   = db.Column(db.String(20))                       # low / medium / high
    probability  = db.Column(db.Float)
    model_used   = db.Column(db.String(100))
    created_at   = db.Column(db.DateTime, default=datetime.datetime.utcnow)

# ─── Lazy-load Models ─────────────────────────────────────────────────────────
_models = {}

def load_model(disease: str):
    if disease not in _models:
        path = os.path.join(MODEL_DIR, f'{disease}_model.pkl')
        if not os.path.exists(path):
            return None
        with open(path, 'rb') as f:
            _models[disease] = pickle.load(f)
    return _models[disease]

# ─── Helpers ──────────────────────────────────────────────────────────────────
def get_risk_level(prob: float) -> str:
    if prob < 0.30:  return 'low'
    if prob < 0.60:  return 'medium'
    return 'high'

def compute_shap(model, X_input_df):
    try:
        explainer = shap.TreeExplainer(model)
        sv = explainer.shap_values(X_input_df)

        if isinstance(sv, list):
            sv = sv[1]

        sv_row = sv[0] if len(sv.shape) > 1 else sv

        feature_names = list(X_input_df.columns)

        shap_dict = {
            feature_names[i]: float(sv_row[i])
            for i in range(len(feature_names))
        }

        sorted_shap = sorted(
            shap_dict.items(),
            key=lambda x: abs(x[1]),
            reverse=True
        )

        base = explainer.expected_value
        #generate simple explanation
        # Generate simple explanations
        explanations = []

        for feat, val in sorted_shap[:5]:

            impact = "increased" if val > 0 else "decreased"

            explanations.append(
                f"{feat} {impact} the disease risk"
        )

        # Generate SHAP chart
        top_n = 10
        top_feats = sorted_shap[:top_n]

        names = [f[0] for f in top_feats]
        values = [f[1] for f in top_feats]

        colors = ['#e63946' if v > 0 else '#00b4d8' for v in values]

        fig, ax = plt.subplots(figsize=(8, 5))

        ax.barh(
            names[::-1],
            values[::-1],
            color=colors[::-1],
            edgecolor='white',
            height=0.6
        )

        ax.axvline(0, color='black', linewidth=0.8)

        ax.set_xlabel('SHAP Value')
        ax.set_title('Feature Contributions (SHAP)')

        plt.tight_layout()

        buf = io.BytesIO()

        plt.savefig(
            buf,
            format='png',
            dpi=120,
            bbox_inches='tight'
        )

        plt.close()

        buf.seek(0)

        chart_b64 = base64.b64encode(
            buf.read()
        ).decode('utf-8')

        return {
            'shap_values': shap_dict,
            'sorted_shap': sorted_shap[:top_n],
            'base_value': float(base) if not isinstance(base, np.ndarray) else float(base[0]),
            'chart_base64': chart_b64,
            'explanations': explanations
        }

    except Exception as e:
        return {
            'error': str(e),
            'shap_values': {}
        }

def preprocess_input(model, raw: dict):

    df = pd.DataFrame([{
        'Pregnancies': raw.get('Pregnancies', 0),
        'Glucose': raw.get('Glucose', 0),
        'BloodPressure': raw.get('BloodPressure', 0),
        'SkinThickness': raw.get('SkinThickness', 0),
        'Insulin': raw.get('Insulin', 0),
        'BMI': raw.get('BMI', 0),
        'DiabetesPedigreeFunction': raw.get('DiabetesPedigreeFunction', 0),
        'Age': raw.get('Age', 0),

        # EXACT SAME ORDER AS TRAINING
        'BMI_Age': raw.get('BMI', 0) * raw.get('Age', 0),
        'Glucose_BMI': raw.get('Glucose', 0) * raw.get('BMI', 0),
        'Preg_Age': raw.get('Pregnancies', 0) * raw.get('Age', 0),
    }])

    return df

def preprocess_heart_input(raw):

    data = {
        'age': raw.get('age', 0),
        'trestbps': raw.get('trestbps', 0),
        'chol': raw.get('chol', 0),
        'thalch': raw.get('thalach', 0),
        'oldpeak': raw.get('oldpeak', 0),
        'ca': raw.get('ca', 0),

        'sex_Male': raw.get('sex', 1),

        'dataset_Hungary': 0,
        'dataset_Switzerland': 0,
        'dataset_VA Long Beach': 0,

        'cp_atypical angina': 1 if raw.get('cp', 0) == 1 else 0,
        'cp_non-anginal': 1 if raw.get('cp', 0) == 2 else 0,
        'cp_typical angina': 1 if raw.get('cp', 0) == 3 else 0,

        'fbs_True': raw.get('fbs', 0),

        'restecg_normal': 1 if raw.get('restecg', 0) == 1 else 0,
        'restecg_st-t abnormality': 1 if raw.get('restecg', 0) == 2 else 0,

        'exang_True': raw.get('exang', 0),

        'slope_flat': 1 if raw.get('slope', 0) == 1 else 0,
        'slope_upsloping': 1 if raw.get('slope', 0) == 2 else 0,

        'thal_normal': 1 if raw.get('thal', 0) == 1 else 0,
        'thal_reversable defect': 1 if raw.get('thal', 0) == 2 else 0
    }

    return pd.DataFrame([data])

def preprocess_kidney_input(raw):

    kidney_features = [
    'age', 'bp', 'sg', 'al', 'su', 'bgr', 'bu', 'sc', 'sod', 'pot', 'hemo', 'rbc_normal', 'pc_normal', 'pcc_present', 'ba_present', 'pcv_\t?', 'pcv_14', 'pcv_15', 'pcv_16', 'pcv_17', 'pcv_18', 'pcv_19', 'pcv_20', 'pcv_21', 'pcv_22', 'pcv_23', 'pcv_24', 'pcv_25', 'pcv_26', 'pcv_27', 'pcv_28', 'pcv_29', 'pcv_30', 'pcv_31', 'pcv_32', 'pcv_33', 'pcv_34', 'pcv_35', 'pcv_36', 'pcv_37', 'pcv_38', 'pcv_39', 'pcv_40', 'pcv_41', 'pcv_42', 'pcv_43', 'pcv_44', 'pcv_45', 'pcv_46', 'pcv_47', 'pcv_48', 'pcv_49', 'pcv_50', 'pcv_51', 'pcv_52', 'pcv_53', 'pcv_54', 'pcv_9', 'wc_\t8400', 'wc_\t?', 'wc_10200', 'wc_10300', 'wc_10400', 'wc_10500', 'wc_10700', 'wc_10800', 'wc_10900', 'wc_11000', 'wc_11200', 'wc_11300', 'wc_11400', 'wc_11500', 'wc_11800', 'wc_11900', 'wc_12000', 'wc_12100', 'wc_12200', 'wc_12300', 'wc_12400', 'wc_12500', 'wc_12700', 'wc_12800', 'wc_13200', 'wc_13600', 'wc_14600', 'wc_14900', 'wc_15200', 'wc_15700', 'wc_16300', 'wc_16700', 'wc_18900', 'wc_19100', 'wc_21600', 'wc_2200', 'wc_2600', 'wc_26400', 'wc_3800', 'wc_4100', 'wc_4200', 'wc_4300', 'wc_4500', 'wc_4700', 'wc_4900', 'wc_5000', 'wc_5100', 'wc_5200', 'wc_5300', 'wc_5400', 'wc_5500', 'wc_5600', 'wc_5700', 'wc_5800', 'wc_5900', 'wc_6000', 'wc_6200', 'wc_6300', 'wc_6400', 'wc_6500', 'wc_6600', 'wc_6700', 'wc_6800', 'wc_6900', 'wc_7000', 'wc_7100', 'wc_7200', 'wc_7300', 'wc_7400', 'wc_7500', 'wc_7700', 'wc_7800', 'wc_7900', 'wc_8000', 'wc_8100', 'wc_8200', 'wc_8300', 'wc_8400', 'wc_8500', 'wc_8600', 'wc_8800', 'wc_9000', 'wc_9100', 'wc_9200', 'wc_9300', 'wc_9400', 'wc_9500', 'wc_9600', 'wc_9700', 'wc_9800', 'wc_9900', 'rc_2.1', 'rc_2.3', 'rc_2.4', 'rc_2.5', 'rc_2.6', 'rc_2.7', 'rc_2.8', 'rc_2.9', 'rc_3', 'rc_3.0', 'rc_3.1', 'rc_3.2', 'rc_3.3', 'rc_3.4', 'rc_3.5', 'rc_3.6', 'rc_3.7', 'rc_3.8', 'rc_3.9', 'rc_4', 'rc_4.0', 'rc_4.1', 'rc_4.2', 'rc_4.3', 'rc_4.4', 'rc_4.5', 'rc_4.6', 'rc_4.7', 'rc_4.8', 'rc_4.9', 'rc_5', 'rc_5.0', 'rc_5.1', 'rc_5.2', 'rc_5.3', 'rc_5.4', 'rc_5.5', 'rc_5.6', 'rc_5.7', 'rc_5.8', 'rc_5.9', 'rc_6.0', 'rc_6.1', 'rc_6.2', 'rc_6.3', 'rc_6.4', 'rc_6.5', 'rc_8.0', 'dm_\tyes', 'dm_ yes', 'dm_no', 'cad_no', 'appet_poor'
]

    # create ALL 202 features with default 0
    data = {}

    # first set everything 0
    for col in kidney_features:
        data[col] = 0


    # numeric values
    data['age'] = raw.get('age', 0)
    data['bp'] = raw.get('bp', 0)
    data['sg'] = raw.get('sg', 0)
    data['al'] = raw.get('al', 0)
    data['su'] = raw.get('su', 0)
    data['bgr'] = raw.get('bgr', 0)
    data['bu'] = raw.get('bu', 0)
    data['sc'] = raw.get('sc', 0)
    data['sod'] = raw.get('sod', 0)
    data['pot'] = raw.get('pot', 0)
    data['hemo'] = raw.get('hemo', 0)

    # categorical
    data['rbc_normal'] = 1
    data['pc_normal'] = 1

    if raw.get('pcc', 0) == 1:
        data['pcc_present'] = 1

    if raw.get('ba', 0) == 1:
        data['ba_present'] = 1

    data['dm_no'] = 1 if raw.get('dm', 0) == 0 else 0
    data['cad_no'] = 1 if raw.get('cad', 0) == 0 else 0
    data['appet_poor'] = 1 if raw.get('appet', 1) == 0 else 0

    # IMPORTANT
    df = pd.DataFrame([data])

    # exact same order as training
    df = df[kidney_features]

    return df    

# ─── Auth Routes ──────────────────────────────────────────────────────────────
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    user = User(
        name=data['name'],
        email=data['email'],
        password=generate_password_hash(data['password'])
    )
    db.session.add(user)
    db.session.commit()
    token = create_access_token(identity=str(user.id))
    return jsonify({'token': token, 'user': {'id': user.id, 'name': user.name, 'email': user.email}})

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    token = create_access_token(identity=str(user.id))
    return jsonify({'token': token, 'user': {'id': user.id, 'name': user.name, 'email': user.email}})

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def me():
    uid  = int(get_jwt_identity())
    user = User.query.get(uid)
    return jsonify({'id': user.id, 'name': user.name, 'email': user.email,
                    'created_at': user.created_at.isoformat()})

# ─── Prediction Routes ────────────────────────────────────────────────────────
def _predict_single(disease, raw_input, user_id=None):

    artifact = load_model(disease)

    if artifact is None:
        return {
            'error': f'Model for {disease} not found'
        }, 404
    model = artifact['model']

    if disease == 'diabetes':
     X = preprocess_input(model, raw_input)

    elif disease == 'heart':
     X = preprocess_heart_input(raw_input)

    elif disease == 'kidney':
     X = preprocess_kidney_input(raw_input)

    try:
        prob = float(model.predict_proba(X)[0][1])
        pred = int(model.predict(X)[0])

    except Exception as e:
        return {
            'error': str(e)
        }, 500

    risk = get_risk_level(prob)

    shap_result = compute_shap(model, X)

    result = {
        'disease': disease,
        'prediction': pred,
        'label': 'Positive' if pred == 1 else 'Negative',
        'probability': round(prob * 100, 2),
        'risk_level': risk,
        'model_used': 'XGBoost',
        'shap': shap_result,
        'model_results': []
    }

    if user_id:
        p = Prediction(
            user_id=user_id,
            disease=disease,
            input_data=json.dumps(raw_input),
            result=json.dumps({
                'label': result['label'],
                'probability': result['probability']
            }),
            risk_level=risk,
            probability=prob,
            model_used='XGBoost'
        )

        db.session.add(p)
        db.session.commit()

        result['prediction_id'] = p.id

    return result, 200

@app.route('/api/predict/diabetes', methods=['POST'])
@jwt_required()
def predict_diabetes():
    uid = int(get_jwt_identity())
    res, code = _predict_single('diabetes', request.json, uid)
    return jsonify(res), code

@app.route('/api/predict/heart', methods=['POST'])
@jwt_required()
def predict_heart():
    uid = int(get_jwt_identity())
    res, code = _predict_single('heart', request.json, uid)
    return jsonify(res), code

@app.route('/api/predict/kidney', methods=['POST'])
@jwt_required()
def predict_kidney():
    uid = int(get_jwt_identity())
    res, code = _predict_single('kidney', request.json, uid)
    return jsonify(res), code

@app.route('/api/predict/combined', methods=['POST'])
@jwt_required()
def predict_combined():
    uid  = int(get_jwt_identity())
    data = request.json
    combined_results = {}
    overall_risk_scores = []
    errors = []

    for disease in ['diabetes', 'heart', 'kidney']:
        d_input = data.get(disease, {})
        if not d_input:
            errors.append(f'No input for {disease}')
            continue
        res, code = _predict_single(disease, d_input, uid)
        if code == 200:
            combined_results[disease] = res
            overall_risk_scores.append(res['probability'])
        else:
            errors.append(res.get('error', f'{disease} prediction failed'))

    if not combined_results:
        return jsonify({'error': 'No predictions could be made', 'details': errors}), 400

    avg_risk  = np.mean(overall_risk_scores)
    risk_lvl  = get_risk_level(avg_risk / 100)
    high_risk = [d for d, r in combined_results.items() if r['risk_level'] == 'high']
    med_risk  = [d for d, r in combined_results.items() if r['risk_level'] == 'medium']

    return jsonify({
        'combined_results':  combined_results,
        'overall_risk':      round(float(avg_risk), 2),
        'overall_risk_level': risk_lvl,
        'high_risk_diseases': high_risk,
        'medium_risk_diseases': med_risk,
        'errors':            errors
    })

# ─── Dashboard Routes ─────────────────────────────────────────────────────────
@app.route('/api/dashboard/history', methods=['GET'])
@jwt_required()
def prediction_history():
    uid   = int(get_jwt_identity())
    limit = request.args.get('limit', 50, type=int)
    preds = (Prediction.query
             .filter_by(user_id=uid)
             .order_by(Prediction.created_at.desc())
             .limit(limit).all())
    return jsonify([{
        'id':          p.id,
        'disease':     p.disease,
        'result':      json.loads(p.result) if p.result else {},
        'risk_level':  p.risk_level,
        'probability': p.probability,
        'model_used':  p.model_used,
        'created_at':  p.created_at.isoformat(),
        'input_data':  json.loads(p.input_data) if p.input_data else {}
    } for p in preds])

@app.route('/api/dashboard/stats', methods=['GET'])
@jwt_required()
def dashboard_stats():
    uid   = int(get_jwt_identity())
    preds = Prediction.query.filter_by(user_id=uid).all()
    if not preds:
        return jsonify({'total': 0, 'by_disease': {}, 'by_risk': {}, 'recent_trend': []})

    by_disease = {}
    by_risk    = {'low': 0, 'medium': 0, 'high': 0}
    for p in preds:
        by_disease[p.disease] = by_disease.get(p.disease, 0) + 1
        if p.risk_level: by_risk[p.risk_level] = by_risk.get(p.risk_level, 0) + 1

    recent = sorted(preds, key=lambda x: x.created_at)[-10:]
    trend  = [{'date': p.created_at.strftime('%Y-%m-%d'),
               'disease': p.disease, 'risk': p.probability} for p in recent]

    return jsonify({'total': len(preds), 'by_disease': by_disease,
                    'by_risk': by_risk, 'recent_trend': trend})

@app.route('/api/models/info', methods=['GET'])
def models_info():
    info = {}
    for disease in ['diabetes', 'heart', 'kidney']:
        artifact = load_model(disease)
        if artifact:
            info[disease] = {
                'model_name':    artifact.get('model_name',''),
                'features':      artifact.get('feature_names',[]),
                'classes':       artifact.get('classes',[]),
                'model_results': artifact.get('model_results',[])
            }
        else:
            info[disease] = {'error': 'Model not trained yet'}
    return jsonify(info)

# ─── Health Check ─────────────────────────────────────────────────────────────
@app.route('/api/health')
def health():
    return jsonify({'status': 'ok', 'timestamp': datetime.datetime.utcnow().isoformat()})

# ─── Main ─────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000)
