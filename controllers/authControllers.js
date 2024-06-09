const adminModal = require("../models/adminModal");
const { responseReturn } = require("../utiles/response");
const bcrpty = require("bcrypt");
const { createToken } = require("../utiles/tokenCreate");

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
  getUser = async (req, res) => {
    const { id, role } = req;
    try {
      if (role === "admin") {
        const user = await adminModal.findById(id);
        responseReturn(res, 200, { userInfo: user });
      }
      else{
        console.log('seller Info..')
      }
    } catch (error) {
      console.log(error.message)

    }
  }; // end getUser
}

module.exports = new authControllers();
