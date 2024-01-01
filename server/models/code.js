const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const codeSchema = mongoose.Schema({
  name: { type: String },
  code: { type: String },
  collapsed: {type: Boolean, default: false},
  date: { type: Date },
  owner: { type: mongoose.Schema.Types.ObjectId, ref:'User' },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref:'User' }],
})
codeSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})
module.exports = mongoose.model('Code', codeSchema)