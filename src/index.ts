import express from 'express'
import morgan from 'morgan'
import dotenv from 'dotenv'
import {router as googleRouter} from './routes/googleRoute'
import { scheduleEmailCheck } from './jobs/emailJob'

const app = express()
app.use(express.json())

// configuring .env for storing secret variables 
dotenv.config()

//Setting Up Morgan For Development
const format = ':method :url :status :response-time ms'
app.use(morgan(format))

//Entry Route
app.get('/', async (req, res) => {
    res.status(200).send("<h1>Hi I am Aditya Rathore and this is my submission for ReachInBox Backend Assessment<h1>")
})

app.get('/server-start', async(req, res)=>{
    try{
        console.log('Initializing email automation tool...');  
        await scheduleEmailCheck();
        console.log('Email check job scheduled to run every 3 minutes.');
        console.log('Worker is now waiting for jobs...');
    }catch(error){
        console.error('Error initializing the email automation tool:', error);
    }
})


//Handling Other Routes
app.use('/google',googleRouter) // localhost:8080/google/auth -> to authenticate the user 

app.listen(process.env.PORT || 8000, () => {
    console.log(`Listening on ${process.env.PORT}`)
})