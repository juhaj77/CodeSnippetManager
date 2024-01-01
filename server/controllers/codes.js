const Code = require('../models/code.js')

const CodeController = {
    getCodes: async (request, response) => {
        const data = await Code.find({owner:{$in:[request.params.id]}})
        const data2 = await Code.find({users:{$in:[request.params.id]}})
        const data3 = data.concat(data2)
        let codes = data3.map(c => c.toJSON())
        response.json({codes: codes.reverse()}) 
    },
    addCode: async (request, response) => {
        const newCode = new Code({name: request.body.name, code:request.body.code, owner:request.body.id, date: request.body.date})
        await newCode.save()
        response.end()
    },
    deleteCode: async (request,response) => {
        await Code.deleteOne({_id: request.params.id})
        response.end()
    },
    updateCode: async (request,response) => {
        await Code.findByIdAndUpdate(request.params.id,request.body)
        response.end()
    }
}
module.exports = CodeController