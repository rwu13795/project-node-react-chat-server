import { body } from "express-validator";
import { inputNames } from "../../utils/enums/input-names";

export const changeGroupName_Body = [
  body(inputNames.new_group_name)
    .isLength({ min: 1, max: 40 })
    .withMessage(
      "Your group name must be between 1 and 40 characters in length"
    ),
];
