
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
    let form = new formidable.IncomingForm();
    let id = uuid();
    let dir = 'uploads/' + id;
    fs.mkdirSync(dir);
    dir += '/content';
    fs.mkdirSync(dir);
    form.on('field',(name,value)=>{
        if (name == 'deleteCode') {
            fs.writeFileSync('uploads/' + id + '/delete.txt',value);
        }
    });
    form.on('file', (field, file)=>{
        let oldPath = file.path;
        let newPath = dir + "/" + file.name;
        fs.writeFileSync(newPath, fs.readFileSync(oldPath));
    });
    form.on('end',()=>{
        res.send(getURL(req) + '/' + id);
    });
    form.parse(req);
});

app.get('/:id',(req,res)=>{
    let id = req.params.id;
    let folder = 'uploads/' + id + '/content';
    if (!fs.existsSync(folder)) {
        res.status(404).send("Shared file/s with this id have been removed.");
        return;
    }
    let files = fs.readdirSync(folder);
    if (files.length > 1) {
        let dest = 'zip/' + id + ".zip";
        if (fs.existsSync(dest)) {
            console.log("downloading existing zip");
            res.download(dest);
        } else {
            console.log("generating zip...");
            zipFolder(folder,dest,(err)=>{
                if (err) throw err;
                res.download(dest);
            });
        }
    } else {
        let fn = folder + '/' + files[0];
        res.download(fn);
    }
});

app.get('/:id/delete',(req,res)=>{
    let id = req.params.id;
    let folder = 'uploads/' + id;
    if (!fs.existsSync(folder)) {
        res.send('Shared file/s with this id have been removed.');
        return;
    }
    let code = req.query.code;
    let savedCode = fs.readFileSync(folder + '/delete.txt');
    if (!savedCode || code == savedCode) {
        removeFolder(folder);
        let zipPath = 'zip/' + id + '.zip';
        if (fs.existsSync(zipPath)) {
            fs.unlinkSync(zipPath);
        }
        res.sendFile(__dirname + '/removed.html');
    } else {
        res.sendFile(__dirname + '/delete.html');
    }
});

app.listen(port, ()=>{
    console.log(`Listening on port ${port}!`);
});

function getURL(req) {
    return req.protocol + '://' + req.get('host');
}

function removeFolder(path) {
    if(fs.existsSync(path)) {
        fs.readdirSync(path).forEach((file)=>{
          var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) {
                removeFolder(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}