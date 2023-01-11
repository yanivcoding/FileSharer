
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const fs = require('fs');

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.text());

app.post('/uploader',(req,res)=>{
    console.log(req.body);
    let files = req.body;
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        fs.rename(file,'uploads/' + file.name, err=>{
            if (err) throw err;
            console.log('File uploaded successfully!');
        });
    }
});

app.listen(port, ()=>{
    console.log(`Listening on port ${port}!`);
});