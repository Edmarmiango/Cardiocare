import sys
import json
import joblib
import numpy as np
import pandas as pd

# Load the model and scaler
model_path = 'ml/best_model.pkl'
scaler_path = 'ml/scaler.pkl'
model = joblib.load(model_path)
scaler = joblib.load(scaler_path)

def getBloodPressureCategory(ap_hi, ap_lo):
    if ap_hi < 120 and ap_lo < 80:
        return 0
    elif 120 <= ap_hi < 130 and ap_lo < 80:
        return 1
    elif 130 <= ap_hi < 140 or 80 <= ap_lo < 90:
        return 2
    elif 140 <= ap_hi or ap_lo >= 90:
        return 3
    elif ap_hi > 180 or ap_lo > 120:
        return 4

def getBMICategory(bmi):
    if bmi < 18.5:
        return 0
    elif 18.5 <= bmi < 25:
        return 1
    elif 25 <= bmi < 30:
        return 2
    elif 30 <= bmi < 35:
        return 3
    elif 35 <= bmi < 40:
        return 4
    else:
        return 5

def getGlucoseCategory(gluc_value):
    if gluc_value >= 70 and gluc_value <= 100:
        return 1  # Normal
    elif gluc_value > 100 and gluc_value <= 125:
        return 2  # Pré-diabetes
    elif gluc_value >= 126:
        return 3  # Diabetes
    else:
        return 0  # Valor fora da faixa normal



def preprocess_input(data):
    # Convert input data to appropriate types
    data['age'] = int(data['age_years'])
    data['gender'] = 1 if data['gender'] == 'male' else 0
    data['height'] = float(data['height'])
    data['weight'] = float(data['weight'])
    data['ap_hi'] = int(data['ap_hi'])
    data['ap_lo'] = int(data['ap_lo'])
    data['cholesterol'] = float(data['cholesterol'])
    data['gluc'] = float(data['gluc'])
    data['smoke'] = 1 if data['smoke'] else 0
    data['alco'] = 1 if data['alco'] else 0
    data['active'] = 1 if data['active'] else 0
    data['bmi'] = float(data['Bmi'])

    # Calculate categories
    data['blood_pressure_category'] = getBloodPressureCategory(data['ap_hi'], data['ap_lo'])
    data['BMI_category'] = getBMICategory(data['bmi'])
   
    # Create DataFrame
    df = pd.DataFrame([data])

    # Convert cholesterol to categories
    df['cholesterol'] = pd.cut(df['cholesterol'], 
                               bins=[0, 200, 240, float('inf')], 
                               labels=[0, 1, 2])
    
     # Convert glucose to categories
    df['gluc'] = df['gluc'].apply(getGlucoseCategory)

    # Select and order columns to match the model's expected features
    feature_columns = [
        'age_years', 'gender', 'height', 'weight', 'ap_hi', 'ap_lo',
        'cholesterol', 'gluc', 'smoke', 'alco', 'active', 'Bmi',
        'blood_pressure_category', 'BMI_category'
    ]

    df = df[feature_columns]

    # Ensure all columns are float
    df = df.astype(float)

    # Scale the features
    scaled_data = scaler.transform(df)

    return scaled_data, df

def get_bp_recommendation(bp_category):
    recommendations = {
        0: "Sua pressão arterial está normal. Continue com um estilo de vida saudável.",
        1: "Você está com pré-hipertensão. Considere mudanças no estilo de vida para reduzir a pressão arterial.",
        2: "Você está com hipertensão de estágio 1. Consulte um médico para orientação e possíveis medicamentos.",
        3: "Você está com hipertensão de estágio 2. É crucial procurar atendimento médico imediatamente.",
        4: "Você está com crise hipertensiva. Procure atendimento médico de emergência."
    }
    return recommendations.get(bp_category, "Categoria de pressão arterial desconhecida.")

def get_bmi_recommendation(bmi_category):
    recommendations = {
        0: "Você está abaixo do peso. Consulte um nutricionista para orientação.",
        1: "Seu peso está normal. Continue mantendo um estilo de vida saudável.",
        2: "Você está com sobrepeso. Considere mudanças na dieta e aumento da atividade física.",
        3: "Você está com obesidade classe 1. É recomendável procurar orientação médica.",
        4: "Você está com obesidade classe 2. Procure um médico para um plano de emagrecimento seguro.",
        5: "Você está com obesidade extrema. Procure atendimento médico especializado."
    }
    return recommendations.get(bmi_category, "Categoria de IMC desconhecida.")

def get_cholesterol_recommendation(chol_category):
    recommendations = {
        0: "Seu nível de colesterol está desejável. Mantenha uma dieta equilibrada, com alimentos ricos em fibras e gorduras saudáveis, e pratique exercícios regularmente.",
        1: "Seu nível de colesterol é limítrofe alto. Reduza o consumo de gorduras saturadas e trans, e aumente a ingestão de fibras e alimentos saudáveis. Monitorar os níveis de colesterol é importante.",
        2: "Seu nível de colesterol é alto. Reduza drasticamente o consumo de gorduras saturadas e trans, e consulte um médico para avaliar a necessidade de tratamento. Pratique exercícios e mantenha uma dieta rica em fibras e alimentos saudáveis."
    }
    return recommendations.get(chol_category, "Categoria de colesterol desconhecida.")

def glucose_recommendation(gluc_category):
    recommendations = {
        1: "Sua glicose está dentro da faixa normal. Mantenha uma dieta equilibrada com baixo teor de açúcares refinados e pratique exercícios regularmente.",
        2: "Você está com pré-diabete. Reduza o consumo de açúcar, aumente a ingestão de fibras (como frutas e vegetais) e pratique atividades físicas para evitar o desenvolvimento de diabetes.",
        3: "Você está com diabete. Reduza drasticamente o consumo de açúcar e busque orientação médica para iniciar o tratamento adequado. Manter um estilo de vida saudável é essencial para controlar a glicose."
    }
    return recommendations.get(gluc_category, "Categoria de glicose desconhecida.")

def get_risk_category(probability):
    if probability < 0.1:
        return 'Muito baixo'
    elif 0.1 <= probability < 0.3:
        return 'Baixo'
    elif 0.3 <= probability < 0.5:
        return 'Moderado'
    elif 0.5 <= probability < 0.7:
        return 'Alto'
    else:
        return 'Muito alto'

def predict(data):
    processed_data, original_df = preprocess_input(data)
    
    probability = model.predict_proba(processed_data)[0][1]
    
    risk_category = get_risk_category(probability)

    bp_recommendation = get_bp_recommendation(getBloodPressureCategory(data['ap_hi'], data['ap_lo']))
    bmi_recommendation = get_bmi_recommendation(getBMICategory(float(data['Bmi'])))
    chol_category = int(original_df['cholesterol'].values[0])
    chol_recommendation = get_cholesterol_recommendation(chol_category)
    # Use the processed glucose category
    gluc_category = int(original_df['gluc'].values[0])
    gluc_recommendation = glucose_recommendation(gluc_category)
    
    response = {
        'probability': f'{probability * 100:.2f}%',
        'risk_category': risk_category,
        'bp_recommendation': bp_recommendation,
        'bmi_recommendation': bmi_recommendation,
        'chol_recommendation': chol_recommendation,
        'gluc_recommendation': gluc_recommendation
    }
    return response

if __name__ == '__main__':
    if len(sys.argv) > 1:
        input_data = json.loads(sys.argv[1])
        result = predict(input_data)
        print(json.dumps(result))
    else:
        print("No input provided. Please provide input data as a JSON string.")

