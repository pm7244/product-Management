const userModel = require("../models/userModel");
const aws = require("aws-sdk");
const AWS = require("../awsfile/aws");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const validation = require("../Util/Validations");

const createUser = async function (req, res) {
  try {
    const data = req.body;

    let profileImage = req.files;

    //using destructuring
    let { fname, lname, email, phone, password, address } = data;

    if (validation.isValidBody(data))
      return res.status(400).send({
        status: false,
        message: "Please!! provide required details to create your account",
      });

    if (validation.isValid(data.fname))
      return res.status(400).send({
        status: false,
        message: "Please!! provide First name",
      });

    if (!validation.isValidString(data.fname.trim()))
      return res.status(400).send({
        status: false,
        message: "First name must be a string",
      });


    if (validation.isValid(data.lname))
      return res.status(400).send({
        status: false,
        message: "Last name must be contains only charachters",
      });

    if (!validation.isValidString(data.lname.trim()))
      return res.status(400).send({
        status: false,
        message: "last name must be a string",
      });


    if (!data.email)
      return res
        .status(400)
        .send({ status: false, message: "User email-id is required" });

    if (!validation.isValidEmail(data.email.trim())) {
      return res
        .status(400)
        .send({ status: false, message: "User email is not valid" });
    }
    //  checking if email is unique or not.
    let checkEmail = await userModel.findOne({ email: email });
    if (checkEmail) {
      return res.status(409).send({ message: "Email Already Registered..." });
    }

    if (profileImage.length == 0)
      return res
        .status(400)
        .send({ status: false, message: "Please upload profile image" });

    if (!data.phone)
      return res
        .status(400)
        .send({ status: false, message: "User phone number is required" });

    if (!validation.isValidPhone(data.phone.trim())) {
      return res
        .status(400)
        .send({ status: false, message: "User phone number is not valid" });
    }


    if (profileImage && profileImage.length > 0) {
     

      if (!validation.validImageType(profileImage[0].mimetype)) {
        return res
            .status(400)
            .send({
                status: false,
                message: "Uploaded file should be in (jpeg/jpg/png) this format",
            });
    }


      var uploadedProfilePictureUrl = await AWS.uploadFile(profileImage[0]);
      
    } else {
      res.status(400).send({ msg: "No file found" });
    }


    //  checking if mobile is unique or not.
    let checkMobile = await userModel.findOne({ phone: phone });
    if (checkMobile) {
      return res.status(409).send({ message: "Mobile Already Registered" });
    }

    if (!data.password)
      return res
        .status(400)
        .send({ status: false, message: "Password is required" });

    if (!validation.isValidPassword(data.password)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter password in valid format" });
    }

    if (validation.isValid(address))
    return res.status(400).send({
      status: false,
      message: "address can't be empty",
    });

    
    // const {address.shipping, address.billing} = address

    address = JSON.parse(address);

    if (!address)
      return res
        .status(400)
        .send({ status: false, message: "Address is required" });

        // const {shipping , billing} = address
        
    if (validation.isValid(address.shipping))
    return res.status(400).send({
      status: false,
      message: "shipping address can't be empty",
    });


    //  checking if city is valid or not.
    if (!address && address.city && !isValidCity(address.city)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid city..." });
    }
    // let { shipping, billing } = address;

    if (!address.shipping.street) {
      return res
        .status(400)
        .send({ status: false, message: "street is required" });
    }

    if (validation.isValid(address.shipping.street))
    return res.status(400).send({
      status: false,
      message: "shipping street can't be empty",
    });

    if (!address.shipping.city) {
      return res
        .status(400)
        .send({ status: false, message: "shipping city is required" });
    }

    if (!validation.isValidString(address.shipping.city))
    return res.status(400).send({
      status: false,
      message: "shipping city is not valid",
    });

    if (!address.shipping.pincode) {
      return res
        .status(400)
        .send({ status: false, message: "shipping pincode is required" });
    }

    if (validation.isValid(address.shipping.pincode))
    return res.status(400).send({
      status: false,
      message: "shipping picode cant be empty",
    });

    //  checking if pincode is valid or not.
    if (address.shipping && address.shipping.pincode && !validation.isValidPincode(address.shipping.pincode)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid pincode..." });
    }

    if (validation.isValid(address.billing))
    return res.status(400).send({
      status: false,
      message: "billing address can't be empty",
    });


    if (!address.billing.street) {
      return res
        .status(400)
        .send({ status: false, message: "billing street is required" });
    }

    if (validation.isValid(address.billing.street))
    return res.status(400).send({
      status: false,
      message: "billing street can't be empty",
    });

    if (!address.billing.city) {
      return res
        .status(400)
        .send({ status: false, message: "billing city is required" });
    }

    if (!validation.isValidString(address.billing.city))
    return res.status(400).send({
      status: false,
      message: "billing city is not valid",
    });

    if (!address.billing.pincode) {
      return res
        .status(400)
        .send({ status: false, message: "pincode is required" });
    }

    //  checking if pincode is valid or not.
    if (address.billing && address.billing.pincode && !validation.isValidPincode(address.billing.pincode)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid pincode..." });
    }


    if(!profileImage)
    return res
    .status(400)
    .send({ status: false, message: "ProfileImage is Mandatory" });


    

   
    //console.log(uploadedProfilePictureUrl);
    // password encryption
    const salt = await bcrypt.genSalt(10);
    encryptedPassword = await bcrypt.hash(password, salt);

    const userData = {
      fname: fname,
      lname: lname,
      email: email,
      profileImage: uploadedProfilePictureUrl,
      phone: phone,
      password: encryptedPassword,
      address: address,
    };
    // registering a new user
    const newUser = await userModel.create(userData);

    res.status(201).send({
      status: true,
      message: "User successfully registered",
      data: newUser,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};


const login = async function (req, res) {
  try {
    requestBody = req.body;

    if ((Object.keys(requestBody).length == 0)) {
      return res.status(400).send({
        status: false,
        message: "please enter Email and Password to login ",
      });
    }
    if (Object.keys(requestBody).length > 2) {
     return res.status(400).send({
        status: false,
        message: "pls enter only email and password in the body",
      });
    }

    //Distructure
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).send({ status: false, message: "EmailId is required" });
    }


    if (!validation.isValidEmail(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter email in valid format" });
    }

    if (!password) {
      return res
        .status(400)
        .send({ status: false, message: "Password is required" });
    }


    if (!validation.isValidPassword(password)) {
      return res
        .status(400)
        .send({ status: false, message: "Please inter password in valid format" });
    }

    let data = await userModel.findOne({ email: email });
    if (!data) {
      return res.status(400).send({
        status: false,
        message: "Email doesnot exist. Please recheck it",
      });
    }

    let passwordMatch = await bcrypt.compare(password, data.password);

    if (passwordMatch == false)
      return res
        .status(400)
        .send({ status: false, message: "Password is incorrect" });

    let expiresIn = { expiresIn: "48h" };
    let token = jwt.sign(
      {
        userId: data._id.toString(),
        group: "group-58",
        iat: Math.floor(Date.now() / 1000)
      },
      "project5",
      expiresIn
    );

    return res.status(200).send({
      status: true,
      message: "user Login Successful",
      data: {
        userId: data._id,
        token: token,
      },
    });
  } catch (err) {
    return res.status(500).send({ status: err.message });
  }
};

const getUser = async function (req, res) {
  try {
    res
      .status(200)
      .send({ message: "Here are the details", data: req.userByUserId });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const updateUser = async function (req, res) {
  try {
    let requestBody = req.body;

    let filter = {};

    let { fname, lname, email, phone, password, address } = requestBody;

    if ((validation.isValidBody(requestBody))&&(req.files==undefined))
    return res.status(400).send({
      status: false,
      message: "Please!! provide required details to update your account",
    });

    if (req.files) {
      let profileImage = req.files

      if (profileImage != undefined && profileImage.length > 0) {

        if (!validation.validImageType(profileImage[0].mimetype)) {
          return res
              .status(400)
              .send({
                  status: false,
                  message: "Uploaded file should be in (jpeg/jpg/png) this format",
              });
      }
  

        var updatedProfilePictureUrl = await AWS.uploadFile(profileImage[0]);

      }

      filter.profileImage = updatedProfilePictureUrl;
    }
    console.log(fname)

    if (fname) {

      if (validation.isValid(fname ))
        return res.status(400).send({
          status: false,
          message: "Please!! provide First name",
        });

      if (!validation.isValidString(fname.trim()))
        return res.status(400).send({
          status: false,
          message: "First name must be a string",
        });

      filter.fname = fname
    }


    if (lname) {

      if (validation.isValid(lname))
        return res.status(400).send({
          status: false,
          message: "Last name must be contains only charachters",
        });

      if (!validation.isValidString(lname.trim()))
        return res.status(400).send({
          status: false,
          message: "last name must be a string",
        });


      filter.lname = lname;
    }


    if (email) {

      if (validation.isValid(email))
        return res.status(400).send({
          status: false,
          message: "email must be contains only charachters",
        });


      if (!validation.isValidEmail(email.trim())) {
        return res
          .status(400)
          .send({ status: false, message: "User email is not valid" });
      }
      //console.log(email.trim())
    }

    if (phone){


      if (validation.isValid(phone))
      return res.status(400).send({
        status: false,
        message: "phone must be contains only charachters",
      });


      if (!validation.isValidPhone(phone.trim())) {
        return res
          .status(400)
          .send({ status: false, message: "User phone number is not valid" });
      }

    }
      if(email||phone){
      //  checking if email is unique or not.
      const isUnique = await userModel.find({
        $or: [{ email: email }, { phone: phone }],
      });
      if (isUnique.length >= 1) {
        if (isUnique.length == 1) {
          if (isUnique[0].email == email) {
            return res
              .status(400)
              .send({ status: false, message: "email already exist" });
          }
          if (isUnique[0].phone == phone) {
            return res
              .status(400)
              .send({ status: false, message: "phone already exist" });
          }
        } else {
          return res
            .status(400)
            .send({ status: false, message: "email and phone already exist" });
        }
      }

      filter.email = email;
      filter.phone = phone;
    }

    if (password) {

      if (validation.isValid(password))
      return res.status(400).send({
        status: false,
        message: "password must be contains only charachters",
      });

      if (!validation.isValidPassword(password)) {
        return res
          .status(400)
          .send({ status: false, message: "Please enter password in valid format" });
      }

      const sameOldPass = await bcrypt.compare(
        password,
        req.userByUserId.password
      );

      if (sameOldPass) {
        return res
          .status(400)
          .send({ status: false, message: "You have used this pass word" });
      }

      const salt = await bcrypt.genSalt(10);
      encryptedPassword = await bcrypt.hash(password, salt);

      filter.password = encryptedPassword;
    }

    if (address) {

      address = JSON.parse(address);

      if (address.shipping) {



        if (address.shipping.street){

          if (validation.isValid(address.shipping.street))
          return res.status(400).send({
            status: false,
            message: "address.shipping.street must be contains only charachters",
          });
    
              filter["address.shipping.street"] = address.shipping.street;

        }

       

        if (address.shipping.city){

          if (!validation.isValidString(address.shipping.city))
          return res.status(400).send({
            status: false,
            message: "address.shipping.city must be contains only charachters",
          });

          filter["address.shipping.city"] = address.shipping.city;
        }
        

        if (address.shipping.pincode)
          if (!validation.isValidPincode(address.shipping.pincode)) {
            return res
              .status(400)
              .send({ status: false, message: "Invalid shiping pincode..." });
          }
        filter["address.shipping.pincode"] = address.shipping.pincode;
      }
      if (address.billing) {

        if (address.billing.street)
          filter["address.billing.street"] = address.billing.street;

        

        if (address.billing.city){

          if (!validation.isValidString(address.billing.city))
          return res.status(400).send({
            status: false,
            message: "address.billing.city must be contains only charachters",
          });

          filter["address.billing.city"] = address.billing.city;

        }
          
        if (address.billing.pincode)
          if (!validation.isValidPincode(address.billing.pincode)) {
            return res
              .status(400)
              .send({ status: false, message: "Invalid pincode..." });
          }
        filter["address.billing.pincode"] = address.billing.pincode;
      }


      if (Object.keys(filter).length === 0) {
        return res.json("Please give something to update");
      }


    }
    const updatedUser = await userModel.findByIdAndUpdate(
      req.userIdFromParam,
      filter,
      { new: true }
    );

    return res.status(200).send({
      message: "Yess!! Your details are updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { createUser, login, getUser, updateUser };