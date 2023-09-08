const { body } = require("express-validator");

const userValidator = {
  create: [
    body("name")
      .exists()
      .withMessage("Name was not provided")
      .bail()
      .notEmpty()
      .withMessage("Name cannot be empty")
      .bail()
      .isString()
      .withMessage("Name must be a string")
      .isLength({ max: 30 })
      .withMessage("Name cannot be more than 30 characters"),
    body("email")
      .exists()
      .withMessage("Email was not provided")
      .bail()
      .notEmpty()
      .withMessage("Email cannot be empty")
      .bail()
      .isString()
      .withMessage("Email must be a string")
      .bail()
      .custom((value) => {
        if (!value.includes("@") || !value.includes(".")) {
          throw new Error("Email must include '@' and a valid domain.");
        }
        return true;
      })
      .withMessage("Email must include '@' and a valid domain."),
    body("username")
      .exists()
      .withMessage("Username was not provided")
      .bail()
      .notEmpty()
      .withMessage("Username cannot be empty")
      .bail()
      .isString()
      .withMessage("Username must be a string")
      .isLength({ max: 10 })
      .withMessage("Username cannot be more than 10 characters"),
    body("role")
      .optional()
      .isNumeric()
      .withMessage("Role must be a number")
      .isIn([1, 2])
      .withMessage("Invalid role"),
    body("phone")
      .exists()
      .withMessage("Phone Number was not provided")
      .bail()
      .matches(/^\+880\d{10}$/)
      .withMessage("Invalid Bangladeshi phone number"),
  ],
};
const authValidator = {
  signup: [
    body("email")
      .exists()
      .withMessage("Email must be provided")
      .bail()
      .isString()
      .withMessage("Email must be a String")
      .bail()
      .isEmail()
      .withMessage("Provide the right email formate")
      .custom((value) => {
        if (!value.includes("@") || !value.includes(".")) {
          throw new Error("Email must include '@' and a valid domain.");
        }
        return true;
      })
      .withMessage("Email must include '@' and a valid domain."),
    body("password")
      .exists()
      .withMessage("Password must be provided")
      .bail()
      .isString()
      .withMessage("Password must be a String")
      .bail()
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minSymbols: 1,
        minNumbers: 1,
      })
      .withMessage(
        "Password should be at least 8 characters, with a minimum of 1 lowercase, 1 uppercase, 1 number, and 1 symbol."
      ),
  ],
};
const cartValidator = {
  addtoCart: [
    body("user")
      .exists()
      .withMessage("User ID was not provided")
      .bail()
      .matches(/^\d{24}$/)
      .withMessage("Invalid User ID (must be 24 digits)"),
    body("product")
      .exists()
      .withMessage("Product ID was not provided")
      .bail()
      .matches(/^\d{24}$/)
      .withMessage("Invalid Product ID (must be 24 digits)"),
  ],
  removefromCart: [
    body("user")
      .exists()
      .withMessage("User ID was not provided")
      .bail()
      .matches(/^\d{24}$/)
      .withMessage("Invalid User ID (must be 24 digits)"),
    body("product")
      .exists()
      .withMessage("Product ID was not provided")
      .bail()
      .matches(/^\d{24}$/)
      .withMessage("Invalid Product ID (must be 24 digits)"),
  ],
};

module.exports = { userValidator, authValidator, cartValidator };
