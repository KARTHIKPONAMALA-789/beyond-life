import asyncHandler from "../middlewares/AsyncHandler";
import { CookieOptions, Request, Response } from "express";
import { Router } from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";

import {
  dbUserCheckV2,
  dbUserDelete,
  validate,
} from "../middlewares/Validator";
import {
  idValidater,
  loginValidator,
  roleParamsValidater,
  forgotPasswordValidator,
  resetPasswordValidator,
} from "../validators";
import config from "../config";
import { IBaseUser, Admin, User, Nominee } from "../models";
import { Role, RoleEnum } from "../types";
import bcrypt from "bcrypt";
import { BadRequest, Forbidden } from "../customErrors";
import {
  generateJwtToken,
  getModelByRole,
  getUserByRole,
  sendMail,
  uploadLocal,
} from "../constants/lib";
import CONFIG from "../config";

const router = Router();

type AddUser = IBaseUser & {
  role: Role;
  category?: string;
  child?: string;
  password?: string;
  mobile?: string;
  address?: string;
  photo?: string;
};

type ParamsWithId = {
  id: string;
};

type UserFilter = {
  role: Role;
  username?: string;
  email?: string;
  limit: string;
  password?: string;
  child?: string;
  page: string;
};

type ChangePassword = {
  newPassword: string;
  role: Role;
};

type UserFilterDropdown = {
  q: string;
  role: Role;
};

router.get(
  "/me",
  asyncHandler(async (req: Request, res: Response) => {
    const { _id: userId, role } = req.user;

    const model = getModelByRole(role);

    if (!model) {
      throw new BadRequest("Invalid role");
    }

    const user = await model.findById(userId);

    if (!user) {
      throw new BadRequest(`User with id ${userId} not found`);
    }

    res.json(user);
  })
);



router.get(
  "/clients",
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const customers = await User.find({});

      res.json({ customers });
    } catch (err) {
      console.log(err);
    }
  })
);

// get / filter users
router.get(
  "/dropdown",
  asyncHandler(async (req: Request, res: Response) => {
    const { q, role } = req.query as UserFilterDropdown;

    let toQuery = {};

    if (q) {
      toQuery = {
        ...toQuery,
        name: {
          $regex: q,
          $options: "i",
        },
        email: {
          $regex: q,
          $options: "i",
        },
      };
    }

    const modelToUse = getModelByRole(role);

    if (!modelToUse) {
      throw new BadRequest("Invalid role");
    }

    const users = await modelToUse.aggregate([
      { $match: toQuery },
      { $sort: { createdAt: -1 } },
      { $project: { _id: 1, name: 1 } },
    ]);

    res.json(users);
  })
);

// login route
router.post(
  "/login",
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password, role } = req.body as AddUser;
    console.log(email, password, role);


    const user: any = await getUserByRole(role, { email });

    if (!user) {
      throw new BadRequest(`No ${role} found with email ${email}`);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new BadRequest("Invalid password");
    }



    const token = generateJwtToken(user as IBaseUser, role);
    res.cookie("token", token, CONFIG.COOKIE_SETTINGS as CookieOptions);

    const toSendUser = {
      name: user.fullname,
      email: user.email,
      _id: user._id,
      role: role,
      isApproved: user.isApproved
    };

    res.json({ msg: "Logged in successfully", user: toSendUser });
  })
);


router.post(
  "/forgot-password",
  asyncHandler(async (req: Request, res: Response) => {
    const { email, role } = req.body;

    const user = await getUserByRole(role as Role, { email });

    // Always return same response to prevent email enumeration
    if (!user) {
      return res.json({
        msg: "If the email exists, an OTP has been sent."
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const otpHash = await bcrypt.hash(otp, config.SALT_ROUNDS);
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // valid for 15 minutes

    console.log(otp);

    // Update user document with reset token and expiry
    await user.updateOne({
      passwordResetToken: otpHash,
      passwordResetExpiry: otpExpiry
    });

    await sendMail(
      email,
      "Password Reset OTP",
      "session-reminder.html",
      {
        // name: user.name,
        otp,
        expiryMinutes: "15"
      }
    );

    res.json({ msg: "If the email exists, an OTP has been sent." });
  })
);

router.post(
  "/reset-password",
  validate(resetPasswordValidator),
  asyncHandler(async (req: Request, res: Response) => {
    const { otp, newPassword, role, email } = req.body;

    const user = await getUserByRole(role as Role, { email });

    if (!user || !user.passwordResetToken || !user.passwordResetExpiry) {
      throw new BadRequest("Invalid or expired OTP");
    }

    // Check OTP expiry
    if (new Date() > user.passwordResetExpiry) {
      await user.updateOne({
        passwordResetToken: undefined,
        passwordResetExpiry: undefined
      });
      throw new BadRequest("OTP has expired");
    }

    // Validate OTP
    const isValidOtp = await bcrypt.compare(otp, user.passwordResetToken);
    if (!isValidOtp) {
      throw new BadRequest("Invalid OTP");
    }

    // Check if new password matches old
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequest("New password cannot be same as old password");
    }

    console.log(newPassword);

    // Update password and clear reset fields
    const passwordHash = await bcrypt.hash(newPassword, config.SALT_ROUNDS);
    await user.updateOne({
      password: passwordHash,
      passwordResetToken: undefined,
      passwordResetExpiry: undefined
    });

    res.json({ msg: "Password reset successfully" });
  })
);


/**
 * @route POST /
 * @desc Register a new user
 * @access Public
 */

router.post(
  "/register",
  uploadLocal.fields([
    { name: "photo", maxCount: 1 },
    { name: "nomineeSign", maxCount: 1 },
  ]),
  asyncHandler(async (req: Request, res: Response) => {
    const {
      username,
      fullname,
      email,
      role,
      password,
      mobile,
      address,
      date_of_birth,
      gender,
      street,
      relation,
      city,
      state,
      zip_code,
      country,
      registeredBy,
    } = req.body;

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const photoFile = files?.photo?.[0];
    const signFile = files?.nomineeSign?.[0];

    if (!password) throw new BadRequest("Password is required");

    const [existingUser, existingAdmin] = await Promise.all([
      User.findOne({ email }),
      Admin.findOne({ email }),
    ]);

    if (existingUser || existingAdmin) {
      throw new BadRequest("Email is already in use");
    }

    const hashedPassword = await bcrypt.hash(password, Number(config.SALT_ROUNDS));

    const photoPath = photoFile
      ? `${config.HOST}/static/uploads/${photoFile.filename}`
      : "";

    const signUrl = signFile
      ? `${config.HOST}/static/uploads/${signFile.filename}`
      : "";

    const baseUser = {
      username,
      fullname,
      email,
      password: hashedPassword,
      isApproved: false,
      passwordResetToken: "",
      passwordResetExpiry: new Date(),
    };

    let newUser;
    let msg = "";

    switch (role) {
      case RoleEnum.ADMIN:
        newUser = await Admin.create(baseUser);
        msg = "Admin created successfully";
        break;

      case RoleEnum.USER:
        newUser = await User.create({
          ...baseUser,
          mobile,
          address,
          photo: photoPath,
          date_of_birth,
          gender,
          street,
          city,
          state,
          zip_code,
          country,
          relation,
        });
        msg = "User registered successfully";
        break;

      case RoleEnum.NOMINEE:
        if (!registeredBy) throw new BadRequest("registeredBy is required for Nominee");
        const signFile = files?.nomineeSign?.[0];

        if (!signFile || !signFile.path) {
          throw new BadRequest("Nominee signature file is missing");
        }

        const signBuffer = fs.readFileSync(signFile.path); // ✅ Read file content
        const signHash = crypto.createHash("sha256")
          .update(signBuffer)
          .digest("hex");

        newUser = await Nominee.create({
          ...baseUser,
          mobile,
          address,
          photo: photoPath,
          nomineeSign: signHash,
          signatureUrl: signUrl,
          date_of_birth,
          gender,
          street,
          city,
          state,
          zip_code,
          country,
          registeredBy,
          relation,
        });
        msg = "Nominee registered successfully";
        break;

      default:
        throw new BadRequest("Invalid role provided");
    }

    res.status(201).json({ msg, userId: newUser._id });
  })
);



router.put(
  "/:id",
  uploadLocal.single("photo"),
  validate(idValidater),
  dbUserCheckV2(),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    let { name, email, role, mobile, address, password } = req.body;

    // Hash new password if provided
    if (password) {
      password = await bcrypt.hash(password, config.SALT_ROUNDS);
    }

    // Handle file upload if provided
    const file = req.file;
    const updateData: any = {
      ...(name && { name }),
      ...(email && { email }),
      ...(mobile && { mobile }),
      ...(address && { address }),
      ...(password && { password }),
    };

    if (file) {
      updateData.photo = `${config.HOST}/static/uploads/${file.filename}`;
      updateData.fileType = file.mimetype;
    }

    // Update based on role
    let result;
    switch (role) {
      case RoleEnum.ADMIN:
        result = await Admin.findByIdAndUpdate(id, updateData, { new: true });
        break;

      case RoleEnum.USER:
        result = await User.findByIdAndUpdate(id, updateData, { new: true });
        break;
      case RoleEnum.NOMINEE:
        result = await Nominee.findByIdAndUpdate(id, updateData, { new: true });
        break;
      default:
        throw new BadRequest("Invalid role provided");
    }

    if (!result) {
      throw new BadRequest("User not found or update failed");
    }

    res.json({ msg: "User updated successfully", updatedUser: result });
  })
);


//admin chnage user status 
router.put(
  "/admin/users/:id",
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const { isApproved } = req.body;
    const role = req.user.role;
    if (role !== RoleEnum.ADMIN) {
      throw new Forbidden("Only admins can update user status");
    }
    const result = await User.findByIdAndUpdate(id, { isApproved }, { new: true });
    if (!result) {
      throw new BadRequest("User not found or update failed");
    }
    res.json({ msg: "User status updated successfully", updatedUser: result });
  }
);



router.get(
  "/my-nominees/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id: userId } = req.params;

    if (!userId || userId.trim() === "") {
      throw new BadRequest("User ID is required in the URL.");
    }

    const nominees = await Nominee.find({ registeredBy: userId })
      .populate("registeredBy", "fullname email") // optional: add more fields
      .select("-password -__v"); // optional: exclude sensitive fields

    res.status(200).json({
      message: "Nominees fetched successfully",
      count: nominees.length,
      data: nominees,

    });
  })
);


router.delete(
  "/:id",
  validate(idValidater),
  validate(roleParamsValidater),
  dbUserDelete(true),
  asyncHandler(async (_req: Request, res: Response) => {
    res.json({ msg: "User deleted successfully" });
  })
);

// delete route
router.delete(
  "/:id",
  validate(idValidater),
  validate(roleParamsValidater),
  dbUserDelete(true),
  asyncHandler(async (_: Request, res: Response) => {
    res.json({ msg: "User deleted successfully" });
  })
);











export default router;
