
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const formidable = require('formidable');
const fs = require('fs');
const uuid = require('uuid');
const zipFolder = require('zip-folder');

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.text());

app.post('/uploader',(req,res)=>{
    let form = formidable.IncomingForm();
    let id = uuid();
    let dir = 'uploads/' + id;
    fs.mkdirSync(dir);
    form.on('file', (field, file)=>{
        let oldPath = file.path;
        let newPath = dir + "/" + file.name;
        fs.writeFileSync(__dirname + '/' + newPath, fs.readFileSync(oldPath));
    });
    form.on('end',()=>{
        res.end(getURL(req) + '/' + id);
    });
    form.parse(req);
});

app.get('/:id',(req,res)=>{
    let id = req.params.id;
    let folder = __dirname + '/uploads/' + id;
    let files = fs.readdirSync(folder);
    if (files.length > 1) {
        let dest = __dirname + '/zip/' + id + ".zip";
        if (fs.existsSync(dest)) {
            res.sendFile(dest);
        } else {
            console.log("generating zip...");
            zipFolder(folder,dest,(err)=>{
                if (err) throw err;
                res.sendFile(dest);
            });
        }
    } else {
        res.sendFile(folder + '/' + files[0]);
    }
    
});

app.listen(port, ()=>{
    console.log(`Listening on port ${port}!`);
});

function getURL(req) {
    return req.protocol + '://' + req.get('host');
}