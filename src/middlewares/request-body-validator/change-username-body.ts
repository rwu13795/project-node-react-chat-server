import { body } from "express-validator";
import { inputNames } from "../../utils/enums/input-names";

export const changeUsername_Body = [
  body(inputNames.username)
    .isLength({ min: 1, max: 40 })
    .withMessage("Your username must be between 1 and 40 characters in length"),
];
