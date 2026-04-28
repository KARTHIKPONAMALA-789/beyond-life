import { param, body, query } from "express-validator";
import { RoleEnum as ROLES } from "../types";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(timezone); // Extend dayjs with timezone plugin
// set dayjs to IST timezone
dayjs.tz.setDefault("Asia/Kolkata");

export const idValidater = [
  param("id").isMongoId().withMessage("Id must be a valid mongo id"),
];

export const roleValidater = [
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(Object.values(ROLES))
    .withMessage("Role must be in " + Object.values(ROLES).join(", ")),
];

export const roleParamsValidater = [
  query("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(Object.values(ROLES))
    .withMessage("Role must be in " + Object.values(ROLES).join(", ")),
];

export const roleWithQParamsValidater = [
  query("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(Object.values(ROLES))
    .withMessage("Role must be in " + Object.values(ROLES).join(", ")),

  query("q").optional().isString().withMessage("Query must be a string"),
];

export const loginValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be a valid email"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6, max: 10 })
    .withMessage("Password must be between 6 and 10 characters"),
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(Object.values(ROLES))
    .withMessage("Role must be in " + Object.values(ROLES).join(", ")),
];

export const forgotPasswordValidator = [
  body("newPassword")
    .notEmpty()
    .withMessage("New Password is required")
    .isLength({ min: 6, max: 10 })
    .withMessage("New Password must be between 6 and 10 characters"),
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(Object.values(ROLES))
    .withMessage("Role must be in " + Object.values(ROLES).join(", ")),
];

export const resetPasswordValidator = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("otp").notEmpty().withMessage("OTP is required"),
  body("newPassword").isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  }),
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(Object.values(ROLES))
    .withMessage("Role must be in " + Object.values(ROLES).join(", ")),
];



// Quiz creation validation
export const quizValidator = [
  body("course")
    .notEmpty()
    .withMessage("Course ID is required")
    .isMongoId()
    .withMessage("Course ID must be a valid MongoDB ObjectId"),
  body("question")
    .notEmpty()
    .withMessage("Question is required"),
  body("options")
    .isArray({ min: 2 })
    .withMessage("Options must be an array with at least two values"),
  body("correctAnswer")
    .notEmpty()
    .withMessage("Correct answer is required")
];

// Quiz submission validation
export const quizSubmissionValidator = [
  body("student")
    .notEmpty()
    .withMessage("Student ID is required")
    .isMongoId()
    .withMessage("Student ID must be a valid MongoDB ObjectId"),
  body("course")
    .notEmpty()
    .withMessage("Course ID is required")
    .isMongoId()
    .withMessage("Course ID must be a valid MongoDB ObjectId"),
  body("answers")
    .isObject()
    .withMessage("Answers must be a valid object")
];

// Course Access Validation
export const courseAccessValidator = [
  body("student")
    .notEmpty()
    .withMessage("Student ID is required")
    .isMongoId()
    .withMessage("Student ID must be valid"),
  body("course")
    .notEmpty()
    .withMessage("Course ID is required")
    .isMongoId()
    .withMessage("Course ID must be valid"),
  body("accessType")
    .notEmpty()
    .withMessage("Access type is required")
    .isIn(["1_MONTH", "3_MONTHS", "6_MONTHS", "1_YEAR"])
    .withMessage("Access type must be one of 1_MONTH, 3_MONTHS, 6_MONTHS, 1_YEAR")
];

// Payment validation
export const paymentValidator = [
  body("student")
    .notEmpty()
    .withMessage("Student ID is required")
    .isMongoId()
    .withMessage("Student ID must be valid"),
  body("course")
    .notEmpty()
    .withMessage("Course ID is required")
    .isMongoId()
    .withMessage("Course ID must be valid"),
  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isNumeric()
    .withMessage("Amount must be a number"),
  body("accessDuration")
    .notEmpty()
    .withMessage("Access duration is required")
    .isIn(["1_MONTH", "3_MONTHS", "6_MONTHS", "1_YEAR"])
    .withMessage("Access duration must be one of 1_MONTH, 3_MONTHS, 6_MONTHS, 1_YEAR"),
  body("transactionId")
    .notEmpty()
    .withMessage("Transaction ID is required")
    .isString()
    .withMessage("Transaction ID must be a string")
];

// Course request validation
export const courseRequestValidator = [
  body("student")
    .notEmpty()
    .withMessage("Student ID is required")
    .isMongoId()
    .withMessage("Student ID must be valid"),
  body("course")
    .notEmpty()
    .withMessage("Course ID is required")
    .isMongoId()
    .withMessage("Course ID must be valid")
];

// Course creation validation
export const courseValidator = [
  body("title")
    .notEmpty()
    .withMessage("Course title is required"),
  body("instructor")
    .notEmpty()
    .withMessage("Instructor ID is required")
    .isMongoId()
    .withMessage("Instructor ID must be valid")
];


