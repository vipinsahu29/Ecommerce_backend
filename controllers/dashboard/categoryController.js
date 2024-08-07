const { formidable } = require("formidable");
const { responseReturn } = require("../../utiles/response");
const cloudinary = require("cloudinary").v2;
const categoryModel = require("../../models/categoryModel");
class categoryController {
  add_category = async (req, res) => {
    const form = formidable();
    console.log("this is working");
    form.parse(req, async (err, fields, files) => {
      if (err) {
        responseReturn(res, 404, { error: "Somthing went wrong" });
      } else {
        let { name } = fields;
        let { image } = files;
        name = name.trim;
        const slug = name.split(" ").join("-");

        cloudinary.config({
          cloud_name: process.env.cloud_name,
          api_key: process.env.api_key,
          api_secret: process.env.api_secret,
          secure: true,
        });
        try {
          const result = await cloudinary.uploader.upload(image.filePath, {
            folder: "categorys",
          });

          if (result) {
            const category = await categoryModel.create({
              name,
              slug,
              image: result.url
            })
            responseReturn(res, 201, { message: "Image upload sucess" });

          } else {
            responseReturn(res, 404, { error: "Image upload fails" });
          }
        } catch (error) {
          responseReturn(res, 500, { error: "Image upload fails" });

        }
      }
    });
  };
  get_category = async (req, res) => {
    console.log("get cat this is working");
  };
}

module.exports = new categoryController();
