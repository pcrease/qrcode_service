const { QRCodeStyling } = require("qr-code-styling-node/lib/qr-code-styling.common.js");
const nodeCanvas = require("canvas");
const { JSDOM } = require("jsdom");
const fs = require("fs");
const { request } = require("http");
var crypto = require('crypto');
const aws = require('aws-sdk');
var path = require('path');
const { stringify } = require("querystring");

const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

module.exports = {

    upload_logo_image_to_s3: function(prefix, filename, extension, fileContents) {
        try {
            var key = crypto.randomBytes(20).toString('hex');

            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: prefix + filename + extension,
                Body: fileContents,
            }

            const uploadedImage = s3.upload(params)
                .promise()
                .catch(console.log('error! - ' + process.env.AWS_BUCKET_NAME))

            return prefix + "/" + filename + extension
        } catch (error) {
            console.log(error)
        }
    },

    create_default_qrcode: function() {
        const options = {
            width: 300,
            height: 300,
            data: "https://www.facebook.com/",
            image: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
            dotsOptions: {
                color: "#4267b2",
                type: "rounded"
            },
            backgroundOptions: {
                color: "#e9ebee",
            },
            imageOptions: {
                crossOrigin: "anonymous",
                margin: 20
            }
        }

        // For canvas type
        const qrCodeImage = new QRCodeStyling({
            nodeCanvas, // this is required
            ...options
        });

        qrCodeImage.getRawData("png").then((buffer) => {
            fs.writeFileSync("test.png", buffer);
        });

        // For svg type
        const qrCodeSvg = new QRCodeStyling({
            jsdom: JSDOM, // this is required
            type: "svg",
            ...options
        });

        qrCodeSvg.getRawData("svg").then((buffer) => {
            fs.writeFileSync("test.svg", buffer);
        });

        // For svg type with the inner-image saved as a blob
        // (inner-image will render in more places but file will be larger)
        const qrCodeSvgWithBlobImage = new QRCodeStyling({
            jsdom: JSDOM, // this is required
            nodeCanvas, // this is required
            type: "svg",
            ...options,
            imageOptions: {
                saveAsBlob: true,
                crossOrigin: "anonymous",
                margin: 20
            }
        });

        qrCodeSvgWithBlobImage.getRawData("svg").then((buffer) => {
            fs.writeFileSync("test_blob.svg", buffer);
        });
    },

    create_qrcode_svg: async function(request) {

        width = request.width
        height = request.height
        data = request.data

        var logo_link = null
        if (request.logo_link != null) {
            logo_link = "https://" + process.env.AWS_BUCKET_NAME + ".s3.eu-central-1.amazonaws.com/" + request.logo_link
        }

        dots_color = '#' + request.dots_color
        dots_type = request.dots_type
        background_color = '#' + request.background_color
        image_margin = request.image_margin

        const options = {
            width: width,
            height: height,
            data: data,
            image: logo_link,
            dotsOptions: {
                color: dots_color,
                type: dots_type
            },
            backgroundOptions: {
                color: background_color,
            },
            imageOptions: {
                crossOrigin: "anonymous",
                margin: image_margin
            }
        }

        // For svg type with the inner-image saved as a blob
        // (inner-image will render in more places but file will be larger)
        // const qrCodeSvgWithBlobImage = new QRCodeStyling({
        //     jsdom: JSDOM, // this is required
        //     nodeCanvas, // this is required
        //     type: "svg",
        //     ...options,
        //     imageOptions: {
        //         saveAsBlob: true,
        //         crossOrigin: "anonymous"
        //     }
        // });

        // const svg_data = qrCodeSvgWithBlobImage.getRawData("svg")
        //     .catch(err => console.error(`failed to read svg file: ${err}`));
        // // For svg type
        const qrCodeSvg = new QRCodeStyling({
            nodeCanvas,
            jsdom: JSDOM, // this is required
            type: "svg",
            ...options
        });

        svg_data = await qrCodeSvg.getRawData("svg")
            // .then((buffer) => {
            //     console.log(buffer.toString());
            // })
        return svg_data.toString()
    }

    // get_logo_image: async function(request) {

    // }
}