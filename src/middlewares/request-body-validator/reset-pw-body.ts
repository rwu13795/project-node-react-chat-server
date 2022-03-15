import { body } from "express-validator";
import { inputNames } from "../../utils/enums/input-names";

export const resetPW_body = [
  body(inputNames.new_password)
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be between 8 and 20 characters"),
  body(inputNames.confirm_new_password)
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be between 8 and 20 characters"),
  body(inputNames.new_password)
    .custom((value, { req }) => {
      if (value.trim() !== req.body.confirm_new_password.trim()) {
        return false;
      }
      return true;
    })
    .withMessage("The passwords do not match"),
  body(inputNames.confirm_new_password)
    .custom((value, { req }) => {
      if (value.trim() !== req.body.new_password.trim()) {
        return false;
      }
      return true;
    })
    .withMessage("The passwords do not match"),
];
