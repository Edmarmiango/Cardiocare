from flask import Flask, request, jsonify
import joblib
import numpy as np
import os
from flask_cors import CORS
from predict import predict

app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['POST'])
def predict_route():
    data = request.json
    result = predict(data)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)

