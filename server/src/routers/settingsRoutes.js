import express from 'express'
import {getSettings,addSetting,updateSetting,deleteSetting} from '../controllers/settingsControllers.js'

const settingsRouter = express.Router()
settingsRouter.get('/list', getSettings)
settingsRouter.post('/add', addSetting)
settingsRouter.put('/update/:settingId', updateSetting)
settingsRouter.delete('/delete/:settingId', deleteSetting)

export default settingsRouter