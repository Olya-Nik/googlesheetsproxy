import express, { Response } from "express"
import { GoogleSpreadsheet } from "google-spreadsheet"
import dotenv from "dotenv"
import * as rt from "runtypes"

dotenv.config()

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const ApiKey = rt.String
const processKey = ApiKey.validate(process.env.GOOGLE_API_KEY)
if (!processKey.success) {
    throw new Error("Error api key")
}
const key = processKey.value

const ListQuery = rt.Record({
    doc: rt.String,
})
app.get("/lists", async (req, res) => {
    const query = ListQuery.validate(req.query)
    if (!query.success)
        return res.status(400).json({ error: query })
        
    const doc = new GoogleSpreadsheet(query.value.doc)
    doc.useApiKey(key)
    await doc.loadInfo()
    const list = doc.sheetsByIndex.map(item => item.title)
    res.send(list)
})

const CellQuery = rt.Record({
    col: rt.String,
    row: rt.String,
    list: rt.String,
    doc: rt.String,
})

app.get("/cell", async (req, res) => {
    const query = CellQuery.validate(req.query)
    if(!query.success) 
        return res.status(400).json({ error: query })

    const doc = new GoogleSpreadsheet(query.value.doc)
    doc.useApiKey(key)
    await doc.loadInfo()
    const sheet = doc.sheetsByTitle[query.value.list]
    const cellName = query.value.col + query.value.row
    await sheet.loadCells(cellName)
    const cellValue = sheet.getCellByA1(cellName).value.toString()

    res.send(cellValue)
})

const port = process.env.PORT || 3000
app.listen(port, (err?: any) => {
    if (err) throw err
    console.log(`Listen on: ${port}`)
})