import { NextResponse } from 'next/server'
import { spawn } from 'child_process'

export async function POST(request: Request) {
 try {
   const body = await request.json()
   
   // Calculate BMI before sending to Python
   const height = body.height / 100 // convert to meters
   const bmi = Number((body.weight / (height * height)).toFixed(2))
   
   const pythonProcess = spawn('python', ['ml/predict.py', JSON.stringify({ ...body, Bmi: bmi })])

   return new Promise((resolve, reject) => {
     let result = ''
     let errorOutput = ''
     
     pythonProcess.stdout.on('data', (data) => {
       result += data.toString()
     })

     pythonProcess.stderr.on('data', (data) => {
       errorOutput += data.toString()
       console.error(`Python Error: ${data}`)
     })

     pythonProcess.on('close', (code) => {
       if (code !== 0) {
         console.error(`Python process exited with code ${code}`)
         console.error('Error output:', errorOutput)
         return resolve(NextResponse.json({ 
           error: 'Error processing prediction',
           details: errorOutput
         }, { status: 500 }))
       }
       
       try {
         const parsedResult = JSON.parse(result)
         resolve(NextResponse.json(parsedResult))
       } catch (parseError) {
         console.error('Error parsing Python output:', parseError)
         resolve(NextResponse.json({ 
           error: 'Error parsing prediction result',
           details: result
         }, { status: 500 }))
       }
     })
   })
 } catch (error) {
   console.error('Error in predict route:', error)
   return NextResponse.json({ 
     error: 'Error processing prediction',
     details: error instanceof Error ? error.message : 'Unknown error'
   }, { status: 500 })
 }
}

