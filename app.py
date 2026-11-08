import os
import glob
import numpy as np
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from neural_engine import SemanticNeuralNetwork

app = Flask(__name__)

# आपका सीक्रेट पासवर्ड
SECRET_PASSWORD = os.environ.get("SECRET_PASSWORD", "mysecret123")

# अपलोड फाइल साइज़ लिमिट (10 MB)
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024

ALLOWED_EXTENSIONS = {'txt', 'md', 'csv', 'json', 'py'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_knowledge_dir():
    k_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "knowledge")
    os.makedirs(k_dir, exist_ok=True)
    return k_dir

def get_knowledge_base():
    """knowledge फोल्डर की सभी फाइलों से वाक्यों को इकट्ठा करता है"""
    documents = []
    k_dir = get_knowledge_dir()
    
    for filepath in sorted(glob.glob(os.path.join(k_dir, "*.*"))):
        fname = os.path.basename(filepath)
        ext = fname.rsplit('.', 1)[-1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            continue

        category = "सामान्य"
        if "about" in fname: category = "व्यक्तिगत"
        elif "tech" in fname: category = "तकनीकी"
        elif "general" in fname: category = "ज्ञान"
        elif "custom" in fname: category = "सीखा हुआ"
        else: category = "अपलोड की गई"

        try:
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                for line in content.split("\n"):
                    clean_line = line.strip()
                    if len(clean_line) >= 4 and not clean_line.startswith("#"):
                        documents.append({
                            "text": clean_line,
                            "file": fname,
                            "category": category
                        })
        except Exception as e:
            print(f"फाइल पढ़ने में त्रुटि ({filepath}): {e}")
    return documents

# न्यूरल नेटवर्क आरंभ करना (Input=128, Hidden1=64, Hidden2=32)
neural_net = SemanticNeuralNetwork(input_dim=128, hidden_dim1=64, hidden_dim2=32, output_dim=10)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/verify_password", methods=["POST"])
def verify_password():
    data = request.json or {}
    password = data.get("password", "")
    if password == SECRET_PASSWORD:
        return jsonify({"success": True})
    return jsonify({"success": False, "error": "गलत पासवर्ड! कृपया सही पासवर्ड डालें।"}), 403

@app.route("/api/architecture", methods=["POST"])
def get_architecture():
    data = request.json or {}
    if data.get("password") != SECRET_PASSWORD:
        return jsonify({"error": "अनधिकृत"}), 403
    return jsonify(neural_net.get_architecture())

@app.route("/api/upload_file", methods=["POST"])
def upload_file():
    """वेबसाइट से सीधे फाइल्स अपलोड करके AI को सिखाने का फीचर"""
    password = request.form.get("password", "")
    if password != SECRET_PASSWORD:
        return jsonify({"error": "गलत पासवर्ड! अपलोड नामंज़ूर।"}), 403

    if 'file' not in request.files:
        return jsonify({"error": "कोई फाइल नहीं चुनी गई।"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "फाइल का नाम खाली है।"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        k_dir = get_knowledge_dir()
        save_path = os.path.join(k_dir, filename)
        
        file.save(save_path)
        
        # नई नॉलेज के बाद कुल तथ्य
        total_facts = len(get_knowledge_base())
        return jsonify({
            "success": True,
            "message": f"फाइल '{filename}' सफलतापूर्वक अपलोड हुई! AI ने इसे अपनी मेमोरी में शामिल कर लिया।",
            "filename": filename,
            "total_facts": total_facts
        })
    else:
        return jsonify({"error": "अमान्य फाइल प्रकार! केवल .txt, .md, .csv या .json फाइलें ही अपलोड की जा सकती हैं।"}), 400

@app.route("/api/ask", methods=["POST"])
def ask():
    data = request.json or {}
    password = data.get("password", "")
    query = data.get("query", "").strip()

    if password != SECRET_PASSWORD:
        return jsonify({"error": "गलत पासवर्ड! एक्सेस नामंज़ूर।"}), 403

    if not query:
        return jsonify({"answer": "कृपया कुछ सवाल पूछिए।", "found": False})

    doc_objs = get_knowledge_base()
    if not doc_objs:
        return jsonify({
            "answer": "knowledge फोल्डर में अभी कोई ज्ञान फाइल्स नहीं हैं। कृपया '📁 फाइल अपलोड' बटन से अपनी फाइलें अपलोड करें!",
            "found": False
        })

    docs = [d["text"] for d in doc_objs]

    try:
        # N-gram range (1, 2) TF-IDF वेक्टर सर्च
        vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1).fit(docs + [query])
        doc_vectors = vectorizer.transform(docs)
        query_vector = vectorizer.transform([query])

        similarities = cosine_similarity(query_vector, doc_vectors).flatten()
        best_match_idx = int(similarities.argmax())
        best_score = float(similarities[best_match_idx])

        # 3-लेयर न्यूरल नेटवर्क फॉरवर्ड पास
        q_dense = query_vector.toarray().flatten()
        padded_input = np.zeros((1, 128))
        copy_len = min(len(q_dense), 128)
        padded_input[0, :copy_len] = q_dense[:copy_len]

        nn_result = neural_net.forward(padded_input)
        a1_sample = nn_result["a1"][0, :8].tolist()
        a2_sample = nn_result["a2"][0, :8].tolist()

        if best_score >= 0.10:
            matched_obj = doc_objs[best_match_idx]
            answer = matched_obj["text"]
            confidence = round(best_score * 100, 1)

            second_best_idx = similarities.argsort()[-2] if len(similarities) > 1 else None
            extra_hint = ""
            if second_best_idx is not None and second_best_idx != best_match_idx:
                second_score = float(similarities[second_best_idx])
                if second_score >= 0.20:
                    extra_hint = f"\n\n💡 अतिरिक्त जानकारी: {doc_objs[second_best_idx]['text']}"

            response_text = f"{answer} {extra_hint}"
            return jsonify({
                "answer": response_text,
                "confidence": confidence,
                "category": matched_obj["category"],
                "file": matched_obj["file"],
                "found": True,
                "activations": {
                    "layer1": [round(float(x), 3) for x in a1_sample],
                    "layer2": [round(float(x), 3) for x in a2_sample]
                }
            })
        else:
            return jsonify({
                "answer": "माफ़ कीजिए, मेरी फाइलों में इस सवाल की सटीक जानकारी नहीं मिली। आप ऊपर दिए '📁 फाइल अपलोड' या 'ज्ञान जोड़ें' बटन से यह जानकारी मुझे सिखा सकते हैं!",
                "confidence": 0,
                "found": False,
                "activations": {
                    "layer1": [round(float(x), 3) for x in a1_sample],
                    "layer2": [round(float(x), 3) for x in a2_sample]
                }
            })

    except Exception as e:
        return jsonify({"answer": f"प्रोसेसिंग में समस्या आई: {str(e)}", "found": False})

@app.route("/api/teach", methods=["POST"])
def teach():
    data = request.json or {}
    password = data.get("password", "")
    new_fact = data.get("fact", "").strip()

    if password != SECRET_PASSWORD:
        return jsonify({"error": "गलत पासवर्ड!"}), 403

    if not new_fact or len(new_fact) < 5:
        return jsonify({"error": "कृपया कम से कम 5 अक्षरों का तथ्य लिखें।"}), 400

    k_dir = get_knowledge_dir()
    custom_file = os.path.join(k_dir, "custom_learned.txt")

    try:
        with open(custom_file, "a", encoding="utf-8") as f:
            f.write(new_fact + "\n")
        return jsonify({
            "success": True,
            "message": "नया ज्ञान सफलतापूर्वक मेमोरी में जोड़ दिया गया!",
            "total_facts": len(get_knowledge_base())
        })
    except Exception as e:
        return jsonify({"error": f"सेव करने में त्रुटि: {str(e)}"}), 500

@app.route("/api/knowledge_list", methods=["POST"])
def knowledge_list():
    data = request.json or {}
    if data.get("password") != SECRET_PASSWORD:
        return jsonify({"error": "अनधिकृत"}), 403
    return jsonify({"items": get_knowledge_base()})

@app.route("/api/files", methods=["POST"])
def list_files():
    data = request.json or {}
    if data.get("password") != SECRET_PASSWORD:
        return jsonify({"error": "अनधिकृत"}), 403

    k_dir = get_knowledge_dir()
    file_list = []
    if os.path.exists(k_dir):
        for filepath in sorted(glob.glob(os.path.join(k_dir, "*.*"))):
            ext = filepath.rsplit('.', 1)[-1].lower()
            if ext in ALLOWED_EXTENSIONS:
                file_list.append(os.path.basename(filepath))
    return jsonify({
        "files": file_list,
        "total_facts": len(get_knowledge_base())
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
