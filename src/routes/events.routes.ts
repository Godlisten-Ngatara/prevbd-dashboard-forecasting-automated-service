import { getJobEvents } from '#controllers/event.controllers.js'
import express from 'express'

const eventsRouter = express.Router()

eventsRouter.get("/events/:jobId", getJobEvents)

export default eventsRouter