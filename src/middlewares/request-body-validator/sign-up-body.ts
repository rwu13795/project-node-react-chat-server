import { body } from "express-validator";
import { inputNames } from "../../utils/enums/input-names";

export const signUp_body = [
  body(inputNames.email).isEmail().withMessage("Email must be valid"),
  body(inputNames.password)
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be between 8 and 20 characters in length"),
  body(inputNames.confirm_password)
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be between 8 and 20 characters in length"),
  body(inputNames.password)
    .custom((value, { req }) => {
      if (value.trim() !== req.body.confirm_password.trim()) {
        console.log("pw", value, "cpw", req.body.confirm_password);
        return false;
      }
      return true;
    })
    .withMessage("The passwords do not match"),
  body(inputNames.confirm_password)
    .custom((value, { req }) => {
      if (value.trim() !== req.body.password.trim()) {
        return false;
      }
      return true;
    })
    .withMessage("The passwords do not match"),
  body(inputNames.username)
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage("Your username must be between 1 and 20 characters in length"),
];
