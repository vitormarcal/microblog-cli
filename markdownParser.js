const fs = require('fs');
const marked = require('marked');
const CHAVE_INTRO = '#INICIO_INTRO';
const FIM_INTRO = '#FIM_INTRO';

module.exports = {
    listar: listar,
    marked: marked
};


function listar(dir, template, target) {
    let list = fs.readdirSync(dir);
    read(template).then(newsTemplate => {
        let promises = list.map(data => read(data, true));
        Promise.all(promises)
            .then(data => {
                data.forEach(e => {
                    let structure = splitStructure(e.data);
                    let hbs = mustache(newsTemplate, {
                        intro: marked(structure.intro),
                        postContent: marked(structure.content)
                    });
                    return write(`${target}\\news\\${e.name}`, hbs);
                });
            }).catch(err => {
            console.log(err);
        });
    }).catch(err => {
        console.log(err);
    });

}

function splitStructure(text) {
    let intro = text.substring(CHAVE_INTRO.length, text.indexOf(FIM_INTRO));
    let content = text.substring(text.indexOf(FIM_INTRO) + FIM_INTRO.length, text.length);
    return {intro: intro, content: content};
}

function mustache(text, data) {
    let result = text;

    for (let prop in data) {
        if (data.hasOwnProperty(prop)) {
            let regExp = new RegExp(`{{${prop}}}`, 'g');
            result = result.replace(regExp, data[prop]);
        }
    }
    return result;
}


function read(fileName, allowResolveName = false) {
    return new Promise((resolve, reject) => {
        fs.readFile(fileName, {encoding: 'utf8'}, (error, data) => {
            if (error) {
                reject(error);
            } else if (allowResolveName) {
                resolve({data: data, name: resolveName(fileName)});
            } else {
                resolve(data);
            }
        });
    });
}

function write(fileName, text) {
    return new Promise((resolve, reject) => {
        fs.writeFile(fileName, text, {encoding: 'utf8'}, (error, data) => {
            if (error) {
                console.error(error);
                reject(error);
            } else {
                resolve(data);
            }
        });
    });
}

function resolveName(fileName) {
    let name = fileName;
    const EXTENSAO = '.md';
    let index = fileName.indexOf(EXTENSAO);
    if (index !== -1) {
        name = fileName.replace(EXTENSAO, '.hbs');
    }
    return name;
}