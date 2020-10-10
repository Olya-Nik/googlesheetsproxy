import express, { Response } from "express"
import { GoogleSpreadsheet } from "google-spreadsheet"
import dotenv from "dotenv"
import * as rt from "runtypes"

dotenv.config()

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const key = process.env.GOOGLE_API_KEY

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
    interface Sheet {
        title: string
    }
    const list = doc.sheetsByIndex.map((item: Sheet): string => item.title)
    res.send(list)
})

interface QueryCell {
    col: string,
    row: string,
    list: string,
    doc: string,

}
interface RequestCell {
    query: QueryCell
}

app.get("/cell", async (req: RequestCell, res: Response) => {
    const doc = new GoogleSpreadsheet(req.query.doc)
    doc.useApiKey(key)
    await doc.loadInfo()
    const sheet = doc.sheetsByTitle[req.query.list.toString()]
    const cellName = req.query.col + req.query.row
    await sheet.loadCells(cellName)
    const cellValue: string = sheet.getCellByA1(cellName).value.toString()

    res.send(cellValue)
})

const port = process.env.PORT || 3000
app.listen(port, (err?: any) => {
    if (err) throw err
    console.log(`Listen on: ${port}`)
})