
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const formidable = require('formidable');
const fs = require('fs');

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.text());

app.post('/uploader',(req,res)=>{
    let form = formidable.IncomingForm();
    form.on('file', (field, file)=>{
        let oldPath = file.path;
        let newPath = '/uploads/' + file.name;
        fs.writeFileSync(__dirname + newPath, fs.readFileSync(oldPath));
    });
    form.parse(req);
});

app.listen(port, ()=>{
    console.log(`Listening on port ${port}!`);
});