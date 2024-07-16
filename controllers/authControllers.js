const adminModal = require("../models/adminModal");
const sellerModel = require("../models/sellerModel");
const sellerCustomerModel = require("../models/chat/sellerCustomerModel");
const { responseReturn } = require("../utiles/response");
const bcrpty = require("bcrypt");
const { createToken } = require("../utiles/tokenCreate");
const { response } = require("express");

class authControllers {
  admin_login = async (req, res) => {
    //console.log(req.body)//in the body we will get all values from api
    //in this case we will get email and password value

    const { email, password } = req.body;
    try {
      const admin = await adminModal.findOne({ email }).select("+password");
      if (admin) {
        const match = await bcrpty.compare(password, admin.password);
        // console.log(`pswd matched ${match}`);
        if (match) {
          const token = await createToken({
            id: admin.id,
            role: admin.role,
          });
          res.cookie("acessToken", token, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          });
          responseReturn(res, 200, { token, message: "Login Success" });
        } else {
          responseReturn(res, 404, { error: "Password Wrong" });
        }
      } else {
        responseReturn(res, 400, { error: "Email not found.." });
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
      console.log(error, "here");
    }
  }; // END method
  seller_login = async(req,res) => {
    const {email,password} = req.body
    try {
        const seller = await sellerModel.findOne({email}).select('+password')
        // console.log(admin)
        if (seller) {
            const match = await bcrpty.compare(password, seller.password)
            // console.log(match)
            if (match) {
                const token = await createToken({
                    id : seller.id,
                    role : seller.role
                })
                res.cookie('accessToken',token,{
                    expires : new Date(Date.now() + 7*24*60*60*1000 )
                }) 
                responseReturn(res,200,{token,message: "Login Success"})
            } else {
                responseReturn(res,404,{error: "Password Wrong"})
            }


        } else {
            responseReturn(res,404,{error: "Email not Found"})
        }

    } catch (error) {
        responseReturn(res,500,{error: error.message})
    }

}
// End Method
  seller_register = async (req, res) => {
    const { email, name, password } = req.body;
    console.log(req.body);
    try {
      const getUser = await sellerModel.findOne({ email });
      if (getUser) {
        responseReturn(res, 404, { error: "Email already exists" });
      } else {
        const seller = await sellerModel.create({
          email,
          name,
          password: await bcrpty.hash(password, 10),
          method: "manually",
          shopInfo: {},
        });
        //console.log("seller", seller);
        await sellerCustomerModel.create({
          myId: seller.id,
        });
        const token = await createToken({
          id: seller.id,
          role: seller.role,
        });
        res.cookie("accessToken", token, {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        responseReturn(res, 201, {token, message: "Register sucess" });
      }
    } catch (error) {
      console.log(error)
      responseReturn(res, 500, { message: "internal server error.." });
    }
  }; //end seller register
  getUser = async (req, res) => {
    const { id, role } = req;
    try {
      if (role === "admin") {
        const user = await adminModal.findById(id);
        responseReturn(res, 200, { userInfo: user });
      } else {
        const seller = await sellerModel.findById(id);
        responseReturn(res, 200, { userInfo: seller });
      }
    } catch (error) {
      console.log(error.message);
    }
  }; // end getUser
}

module.exports = new authControllers();
