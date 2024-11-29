import axios from 'axios'

export interface PredictionInput {
  age_years: number
  gender: 'male' | 'female'
  height: number
  weight: number
  ap_hi: number
  ap_lo: number
  cholesterol: number
  gluc: number
  smoke: boolean
  alco: boolean
  active: boolean
}

export async function predictCardiovascularRisk(input: PredictionInput): Promise<number> {
  try {
    const response = await axios.post(
      'https://your-ml-model-endpoint.com/predict',
      input,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ML_API_KEY}`
        }
      }
    )
    return response.data.risk_score
  } catch (error) {
    console.error('Error predicting cardiovascular risk:', error)
    throw new Error('Failed to predict cardiovascular risk')
  }
}

