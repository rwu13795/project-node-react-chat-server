import { body } from "express-validator";
import { inputNames } from "../../utils/enums/input-names";

export const createNewGroup_Body = [
  body(inputNames.group_name)
    .isLength({ min: 1, max: 40 })
    .withMessage(
      "Your group name must be between 1 and 40 characters in length"
    ),
];
