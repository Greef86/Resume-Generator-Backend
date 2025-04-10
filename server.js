import express from "express"
import PDFFile from "pdfkit"
import fs from "fs"
import path from "path"
import {fileURLToPath} from "url"
import cookieParser from "cookie-parser"
import cors from "cors"
import "dotenv/config.js"

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors())

const PDFDIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "PDF")
if(!fs.existsSync(PDFDIR)){
    fs.mkdirSync(PDFDIR, {recursive: true})
}

const dateCalculator = (date) => {
    if(date === "Current"){
        return "Current"
    }else if(date === "Lifetime Certificate"){
        return "Lifetime Certificate"
    }else{
        const day = Number(date.split("-")[2])
        const month = ((date.split("-")[1] === "01") && "January") ||
                      ((date.split("-")[1] === "02") && "February") ||
                      ((date.split("-")[1] === "03") && "March") ||
                      ((date.split("-")[1] === "04") && "April") ||
                      ((date.split("-")[1] === "05") && "May") ||
                      ((date.split("-")[1] === "06") && "June") ||
                      ((date.split("-")[1] === "07") && "July") ||
                      ((date.split("-")[1] === "08") && "August") ||
                      ((date.split("-")[1] === "09") && "September") ||
                      ((date.split("-")[1] === "10") && "October") ||
                      ((date.split("-")[1] === "11") && "November") ||
                      ((date.split("-")[1] === "12") && "December") 
        const year = date.split("-")[0]
        return `${day} ${month} ${year}`
    }
}

app.post("/generate-file", (req, res) => {
    try {
        const data = req.body

        const files = fs.readdirSync(PDFDIR)
        if(files.length > 0){
            const oldFile = files[0]
            const filepath = path.join(PDFDIR, oldFile)
            if(filepath){
                fs.unlinkSync(filepath)
            }
        }

        const document = new PDFFile()
        const fileName = `resume_${Date.now()}.pdf`
        const filePath = path.join(PDFDIR, fileName)
        const writeStream = fs.createWriteStream(filePath)

        document.pipe(writeStream)

        document.fontSize(20).font("Times-Bold").text(`${data.firstName} ${data.lastName}`, {align: "center"})
        document.fontSize(18).font("Times-Bold").text(data.profession, {align: "center"})
        document.moveDown(0.8)
        document.fontSize(14).font("Times-Roman").text(`${data.country}, ${data.province}, ${data.city}, ${data.suburb}, ${data.zipCode}`, {align: "center"})
        document.moveDown(0.2)
        document.fontSize(14).fillColor("blue").font("Times-Roman").text(data.email, {align: "center", link: `mailto:${data.email}`})
        document.moveDown(0.2)
        document.fontSize(14).fillColor("black").font("Times-Roman").text(data.phone, {align: "center"})
        document.moveDown(0.8)
        document.fontSize(12).font("Helvetica-Oblique").text(data.intro, {align: "center"})
        document.moveDown(1.5)
        if(data.WorkExperience && JSON.parse(data.WorkExperience).length > 0){
            document.fontSize(14).opacity(0.5).font("Times-Bold").text("", {align: "left"})
            document.fontSize(14).opacity(0.5).font("Times-Bold").text("WORK EXPERIENCE", {align: "left"})
            document.moveDown(-1)
            document.fontSize(14).opacity(0.5).font("Times-Bold").text("__________________________________________________________________", {align: "left"})
            document.moveDown(0.2)
            for(const experience of JSON.parse(data.WorkExperience)){
                document.fontSize(14).opacity(1).font("Times-Bold").text(experience.company, {align: "left"})
                document.fontSize(14).opacity(1).font("Times-Roman").text(experience.jobTitle, {align: "left"})
                document.fontSize(14).opacity(1).font("Times-Roman").text(`From ${dateCalculator(experience.startDate)} To ${dateCalculator(experience.endDate)}`, {align: "left"})
                document.moveDown(0.6)
            }
            document.moveDown(0.8)
        }
        if(data.school && JSON.parse(data.school).length > 0){
            document.fontSize(14).opacity(0.5).font("Times-Bold").text("", {align: "left"})
            document.fontSize(14).opacity(0.5).font("Times-Bold").text("EDUCATION", {align: "left"})
            document.moveDown(-1)
            document.fontSize(14).opacity(0.5).font("Times-Bold").text("__________________________________________________________________", {align: "left"})
            document.moveDown(0.2)
            for(const education of JSON.parse(data.school)){
                document.fontSize(14).opacity(1).font("Times-Bold").text(education.school, {align: "left"})
                document.fontSize(14).opacity(1).font("Times-Roman").text(education.certificate, {align: "left"})
                document.fontSize(14).opacity(1).font("Times-Roman").text(education.qualification, {align: "left"})
                document.fontSize(14).opacity(1).font("Times-Roman").text(`From ${dateCalculator(education.startDate)} To ${dateCalculator(education.endDate)}`, {align: "left"})
                document.moveDown(0.6)
            }
            document.moveDown(0.8)
        }
        if(data.skill && JSON.parse(data.skill).length > 0){
            document.fontSize(14).opacity(0.5).font("Times-Bold").text("", {align: "left"})
            document.fontSize(14).opacity(0.5).font("Times-Bold").text("SKILLS", {align: "left"})
            document.moveDown(-1)
            document.fontSize(14).opacity(0.5).font("Times-Bold").text("__________________________________________________________________", {align: "left"})
            document.moveDown(0.2)
            for(const skill of JSON.parse(data.skill)){
                document.fontSize(14).opacity(1).font("Times-Bold").text(skill.skill, {align: "left", continued: true})
                document.fontSize(14).opacity(1).font("Times-Roman").text(` ===> ${skill.proficiency}`)
                document.moveDown(0.1)
            }
            document.moveDown(0.8)
        }
        if(data.certificate && JSON.parse(data.certificate).length > 0){
            document.fontSize(14).opacity(0.5).font("Times-Bold").text("", {align: "left"})
            document.fontSize(14).opacity(0.5).font("Times-Bold").text("CERTIFICATIONS/LICENCES", {align: "left"})
            document.moveDown(-1)
            document.fontSize(14).opacity(0.5).font("Times-Bold").text("__________________________________________________________________", {align: "left"})
            document.moveDown(0.2)
            for(const certification of JSON.parse(data.certificate)){
                document.fontSize(14).opacity(1).font("Times-Bold").text(certification.name, {align: "left"})
                document.fontSize(14).opacity(1).font("Times-Roman").text(`From ${dateCalculator(certification.dateIssued)} To ${dateCalculator(certification.expiryDate)}`, {align: "left"})
                document.fontSize(11).opacity(1).font("Helvetica-Oblique").text(certification.details, {align: "left"})
                document.moveDown(0.6)
            }
            document.moveDown(0.8)
        }
        if(data.languages && JSON.parse(data.languages).length > 0){
            document.fontSize(14).opacity(0.5).font("Times-Bold").text("", {align: "left"})
            document.fontSize(14).opacity(0.5).font("Times-Bold").text("LANGUAGES", {align: "left"})
            document.moveDown(-1)
            document.fontSize(14).opacity(0.5).font("Times-Bold").text("__________________________________________________________________", {align: "left"})
            document.moveDown(0.2)
            for(const language of JSON.parse(data.languages)){
                document.fontSize(14).opacity(1).font("Times-Bold").text(language.skill, {align: "left", continued: true})
                document.fontSize(14).opacity(1).font("Times-Roman").text(` ===> ${language.proficiency}`)
                document.moveDown(0.1)
            }
            document.moveDown(0.8)
        }
        if(data.links && JSON.parse(data.links).length > 0){
            document.fontSize(14).opacity(0.5).font("Times-Bold").text("", {align: "left"})
            document.fontSize(14).opacity(0.5).font("Times-Bold").text("LINKS", {align: "left"})
            document.moveDown(-1)
            document.fontSize(14).opacity(0.5).font("Times-Bold").text("__________________________________________________________________", {align: "left"})
            document.moveDown(0.2)
            for(const link of JSON.parse(data.links)){
                document.fillColor("blue").fontSize(14).opacity(1).font("Times-Roman").text(link, {align: "left", link: link})
                document.moveDown(0.2)
            }
            document.moveDown(0.8)
        }
        if(data.publications && JSON.parse(data.publications).length > 0){
            document.fontSize(14).opacity(0.5).font("Times-Bold").text("", {align: "left"})
            document.fillColor("black").fontSize(14).opacity(0.5).font("Times-Bold").text("PUBLICATIONS", {align: "left"})
            document.moveDown(-1)
            document.fontSize(14).opacity(0.5).font("Times-Bold").text("__________________________________________________________________", {align: "left"})
            document.moveDown(0.2)
            for(const publication of JSON.parse(data.publications)){
                document.fillColor("black").fontSize(14).opacity(1).font("Times-Bold").text(publication.name, {align: "left"})
                document.fillColor("blue").fontSize(14).opacity(1).font("Times-Roman").text(publication.link, {align: "left", link: publication.link})
                document.fillColor("black").fontSize(14).opacity(1).font("Times-Roman").text(`Published: ${dateCalculator(publication.date)}`, {align: "left"})
                document.fillColor("black").fontSize(11).opacity(1).font("Helvetica-Oblique").text(publication.details, {align: "left"})
                document.moveDown(0.6)
            }
        }
        document.end()
        writeStream.on("finish", () => {
            return res.status(200).json({fileName})
        })
        writeStream.on("error", (err) => {
            return res.status(500).json({error: err.message})
        })
    } catch (error) {
        return res.status(500).json({error: error})
    }
})

app.get("/download", (req, res) => {
    try {
        const fileName = decodeURIComponent(req.query.file) 

        if(!fileName){
            return res.status(400).json({error: "Please Generate & View Resume First!"})
        }

        const filePath = decodeURIComponent(path.join(PDFDIR, fileName)) 

        return res.download(filePath, fileName, (err) => {
            if(err){
                return res.status(500).json({error: "Something Went Wrong!!!"})
            }
        })
    } catch (error) {
        return res.status(500).json({error: error})
    }
})

const port = process.env.PORT || 4000

app.listen(port, (err) => {
    if(err){
        console.log(err.message)
    }else{
        console.log(`Server Running On Port: ${port}`)
    }
})