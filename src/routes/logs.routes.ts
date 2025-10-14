import { getLogsById } from '#controllers/logs.controllers.js'
import express from 'express'

const logsRouter = express.Router()

logsRouter.get('/logs/:jobId', getLogsById)

export default logsRouter
