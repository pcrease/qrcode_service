const express = require("express");
const app = express();
const port = process.env.PORT || 3001;
const qrcode_generator = require('./qrcode_generator');
const url_handler = require('url');
var fs = require('fs');
const multer = require('multer');
const os = require('os')
const upload = multer({ dest: "/tmp" });
var path = require('path');
const nunjucks = require('nunjucks')
nunjucks.configure('./templates', { autoescape: true });

app.use('/test', (req, res, next) => {
    console.log('Times: ', Date.now());
    //qrcode_generator.create_qrcode()
    next();
});

app.get('/health', (req, res) => {
    res.send('Successful response.');
});

app.get("/", (req, res) => res.type('html').send(html));

app.get("/get_qrcode_styled", (request, response) => {
    svg = nunjucks.render('qrcode_card_template.svg', { footer: 'it hddas worked!' });
    response.writeHeader(200, { "Content-Type": "image/svg+xml" });
    response.write(svg);
    response.end();
    // fs.readFile('./templates/qrcode_card.svg', function(err, html) {
    //     if (err) {
    //         throw err;
    //     }
    //     response.writeHeader(200, { "Content-Type": "image/svg+xml" });
    //     response.write(html);
    //     response.end();
    // });
});

app.get("/get_qrcode_template_styled", async(request, response) => {
    query = url_handler.parse(request.url, true).query;
    svg = await qrcode_generator.render_qrcode_from_template(query)
    response.writeHeader(200, { "Content-Type": "image/svg+xml" });
    response.write(svg);
    response.end();
});

app.get('/get_qrcode', async(request, response) => {
    try {
        var query = url_handler.parse(request.url, true).query;
        svg_data = await qrcode_generator.create_qrcode_svg(query)
        response.setHeader('Content-Type', 'image/svg+xml');
        response.end(svg_data);
    } catch (error) {
        console.log(error)
    }
});


app.get('/get_default_qrcode', async(request, response) => {
    try {
        var query = url_handler.parse(request.url, true).query;
        svg_data = await qrcode_generator.create_default_qrcode(query)
        response.setHeader('Content-Type', 'image/svg+xml');
        response.end(svg_data);
    } catch (error) {
        console.log(error)
    }
});


app.post('/upload_logo_image', upload.single('file'), (request, response) => {
    try {
        var file = request.file;
        var filename = request.body.required_filename
        var prefix = request.body.prefix
        extension = path.extname(file.originalname)

        fs.readFile(request.file.path, async function(err, data) {
            if (err) throw err;
            const logo_link = await qrcode_generator.upload_logo_image_to_s3(prefix, filename, extension, data)

            fs.unlink(file.path, function(err) {
                if (err) {
                    console.error(err);
                }
                console.log('Temp File Delete');
            });
            console.log('Successfully uploaded data');
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify({ logo_link: logo_link }));

        });
    } catch (error) {
        fs.unlink(file.path, function(err) {
            if (err) {
                console.error(err);
            }
            console.log('Temp File Delete');
        });
        console.log(error)
    }
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`));


const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Hello from Render!</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <script>
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          disableForReducedMotion: true
        });
      }, 500);
    </script>
    <style>
      @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
      @font-face {
        font-family: "neo-sans";
        src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
        font-style: normal;
        font-weight: 700;
      }
      html {
        font-family: neo-sans;
        font-weight: 700;
        font-size: calc(62rem / 16);
      }
      body {
        background: white;
      }
      section {
        border-radius: 1em;
        padding: 1em;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
      }
    </style>
  </head>
  <body>
    <section>
      Hello from Render!
    </section>
  </body>
</html>
`