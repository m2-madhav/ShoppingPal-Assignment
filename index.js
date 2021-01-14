const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Joi = require('joi');

const port = 3000;


app.use(express.json());
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/books',{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>console.log('Connected to MongoDB')).
catch(err=>console.log("Error Occured",err));

const bookSchema = new mongoose.Schema({
    Author:{type:String,required:true},
    Title:{type:String,required:true},
    ISBN:{type:Number,required:true},
    ReleaseDate:{type:Date}
});

const bookModel = mongoose.model('bookModel',bookSchema);

app.get('/book',(req,res)=>{
    bookModel.find().then((m)=>res.send(m));
});

app.post('/book',(req,res)=>{
        const schema = Joi.object({
            Author:Joi.string().min(1).required(),
            Title:Joi.string().min(1).required(),
            ISBN:Joi.number().min(10).required(),
            ReleaseDate:Joi.date()
        });
        const validateObj = schema.validate(req.body);
        if(validateObj.error){
            res.status(400).send(validateObj.error.details[0].message);
            return;
        }

        const obj = new bookModel({
            Author:req.body.Author,
            Title:req.body.Title,
            ISBN:req.body.ISBN,
            ReleaseDate:req.body.ReleaseDate
        });
        obj.save().then(book=>{
            res.status(201).send(book);
        });
});


app.patch('/book/:id',(req,res)=>{
    const id = req.params.id;
    bookModel.findByIdAndUpdate(id,req.body,({new:true})).then(result=>res.send(result))
    .catch(error=>res.status(400).send({message:err.message}));
});

app.delete('/book/:id',(req,res)=>{
    const id  = req.params.id;
    bookModel.findByIdAndDelete(id).then(()=>res.status(200).send("deleted")).
    catch(error=>res.status(400).send({message:error.message}));
});


app.listen(port,()=>console.log(`App is listening to ${port}!`));
module.exports = app;

