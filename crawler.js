let request = require('request');
let cheerio = require('cheerio');
let fs = require('fs')

/**
 * Get all filenames from the Funda directory that end with *.html
 */
let files = fs.readdirSync('./Funda');
let fileNames = [];
for(let i = 0; i < files.length; i++) {
    if(files[i].endsWith('.html')) {
        fileNames.push('./Funda/' + files[i]);
    }
}
console.log(fileNames);

let jsonFile = './funda.json';

/**
 * From all the filenames, parse the html and put the data in a json file
 */
for(let i = 0; i < fileNames.length; i++) {
    console.log('Parsing file: ' + fileNames[i]);

    let data = fs.readFileSync(fileNames[i], 'utf8');
    
    if(i === 0) {
        fs.writeFileSync(jsonFile, '[');
    }

    let $ = cheerio.load(data);
    let length = $('.search-result-content-inner').length;
    console.log('File-length: ' + length);

    for(let j = 0; j < length; j++) {
        let adres = getAdres($, j);
        let postcodePlaats = getPostcodePlaats($, j);
        let postcode = postcodePlaats.substring(0, 8);
        let plaats = postcodePlaats.substring(8, postcodePlaats.length);
        let oppervlakte = getOppervlakte($, j);
        let url = getUrl($, j);
        let json = JSON.stringify({'adres':adres, 'postcode':postcode, 'plaats':plaats, 'oppervlakte':oppervlakte, 'url':url});

        fs.appendFileSync(jsonFile, json);

        if(i === fileNames.length - 1 && j === length - 1) {
            fs.appendFileSync(jsonFile, ']');
            console.log('Finished creating Funda JSON file!');
        } else {
            fs.appendFileSync(jsonFile, ',');
        }
    }
}



//let pageToVisit = 'http://localhost:8080/ZZZTest/Bedrijfspand_Rijssen.html';

/*console.log('Visiting page ' + pageToVisit);
request(pageToVisit, (error, response, body) => {
    if(error) {
        console.log(error);
    }
    // Check status code (200 is HTTP OK)
    console.log('Status code: ' + response.statusCode);
    if(response.statusCode === 200) {
        // Parse the document body
        let $ = cheerio.load(body);
        let length = $('.search-result-content-inner').length;
        let fileName = './rijssen.json';

        fs.writeFileSync(fileName, '[');
        for(let i = 0; i < length; i++) {

            let adres = getAdres($, i);
            let postcodePlaats = getPostcodePlaats($, i);
            let postcode = postcodePlaats.substring(0, 8);
            let plaats = postcodePlaats.substring(8, postcodePlaats.length);
            let oppervlakte = getOppervlakte($, i);
            let url = getUrl($, i);
            let json = JSON.stringify({'adres':adres, 'postcode':postcode, 'plaats':plaats, 'oppervlakte':oppervlakte, 'url':url});

            fs.appendFileSync(fileName, json);
            if(i < length-1) {
                fs.appendFileSync(fileName, ',');
            }
        }

        fs.appendFileSync(fileName, ']');
        console.log('Success. File written to: ' + fileName);
    }
});*/

function getUrl($, i) {
    let url = $('.search-result-header');
    return url[i].children[1].attribs.href;
}

function getOppervlakte($, i) {
    let opp = $('.search-result-kenmerken');
    return opp[i].children[0].next.children[1].children[0].data.trim();
}

function getPrijs($, i) {
    let prijs = $('.search-result-price');
    return prijs[i].children[0].data.trim();
}

function getPostcodePlaats($, i) {
    let pp = $('.search-result-subtitle');
    return pp[i].children[0].data.trim();
}

function getAdres($, i) {
    let title = $('.search-result-title');
    return title[i].children[0].data.trim();
}