import { body } from "express-validator";
import { inputNames } from "../../utils/enums/input-names";

export const changeUsername_Body = [
  body(inputNames.username)
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage("Your username must be between 1 and 20 characters in length"),
];
