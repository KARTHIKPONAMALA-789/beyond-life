import { Router, Request, Response } from "express";
import multer from "multer";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { WillModel } from "../models/will.model";
import asyncHandler from "../middlewares/AsyncHandler";
import { BadRequest, NotFound, Unauthorized } from "../customErrors";
import mongoose from "mongoose";
import { Nominee, NomineeRequest } from "../models";
import { sendMail, uploadLocal } from "../constants/lib";
import { config } from "dotenv";
import CONFIG from "../config";


// 🔐 RSA key generation logic
function ensureRSAKeysExist() {
  const publicKeyPath = path.join(__dirname, "..", "public.pem");
  const privateKeyPath = path.join(__dirname, "..", "private.pem");

  if (!fs.existsSync(publicKeyPath) || !fs.existsSync(privateKeyPath)) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });

    fs.writeFileSync(publicKeyPath, publicKey);
    fs.writeFileSync(privateKeyPath, privateKey);
    console.log("✅ RSA key pair generated: public.pem and private.pem");
  }
}

// Define interfaces for clarity and type safety
interface NomineeAttributes {
  [key: string]: string | number | boolean;
}

interface WillAttributes {
  [key: string]: string | number | boolean | string[] | { operator: string; value: number };
}

interface Nominee {
  attributes: NomineeAttributes;
  // Other fields like _id, email, name, etc.
}

interface Will {
  attributes: WillAttributes;
  policy: string;
  // Other fields like _id, title, nomineeIds, etc.
}

// Helper function to check nominee attributes against will policy
function checkNomineeAttributes(nominee: Nominee, will: Will): boolean {
  // If policy is not ATTRIBUTE_BASED, no attribute check is needed
  if (will.policy !== "ATTRIBUTE_BASED") {
    return true;
  }

  // If will has no attributes defined, allow access
  if (!will.attributes || Object.keys(will.attributes).length === 0) {
    return true;
  }

  // If nominee has no attributes, deny access
  if (!nominee.attributes) {
    return false;
  }

  // Check each required attribute in the will
  for (const [key, requiredValue] of Object.entries(will.attributes)) {
    const nomineeValue = nominee.attributes[key];

    // If nominee doesn't have the required attribute, deny access
    if (nomineeValue === undefined) {
      return false;
    }

    // Handle different types of required values
    if (typeof requiredValue === "string") {
      // Exact match for strings
      if (nomineeValue !== requiredValue) {
        return false;
      }
    } else if (typeof requiredValue === "number") {
      // Exact match for numbers
      if (nomineeValue !== requiredValue) {
        return false;
      }
    } else if (Array.isArray(requiredValue)) {
      // Check if nominee's value is in the allowed list
      if (!requiredValue.includes(nomineeValue as string)) {
        return false;
      }
    } else if (typeof requiredValue === "object" && requiredValue.operator && requiredValue.value) {
      // Handle range or comparison conditions (e.g., age > 18)
      const nomineeNum = Number(nomineeValue);
      const requiredNum = Number(requiredValue.value);

      if (isNaN(nomineeNum) || isNaN(requiredNum)) {
        return false;
      }

      switch (requiredValue.operator) {
        case ">":
          if (nomineeNum <= requiredNum) return false;
          break;
        case ">=":
          if (nomineeNum < requiredNum) return false;
          break;
        case "<":
          if (nomineeNum >= requiredNum) return false;
          break;
        case "<=":
          if (nomineeNum > requiredNum) return false;
          break;
        case "=":
          if (nomineeNum !== requiredNum) return false;
          break;
        default:
          return false; // Invalid operator
      }
    } else {
      // Unsupported attribute type
      return false;
    }
  }

  // All attributes match
  return true;
}

// ✅ Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail", // Replace with your email service
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
});

// Helper function to send email with secret key (max 10 words)
async function sendSecretKeyEmail(
  nominee: any,
  will: any,
  secretKey: string,
  isApproval = false
) {
  const subject = isApproval
    ? "Will Access Approved"
    : "Added as Will Nominee";

  const templateName = isApproval
    ? "access_approved.html" // if you have a separate template for approval
    : "nominee_added.html";  // your existing template

  await sendMail(nominee.email, subject, templateName, {
    name: nominee.name || "Nominee",
    secretKey,
  });

  console.log(`📧 Email sent to ${nominee.email} with secret key`);
}

const router = Router();

router.post(
  "/upload-will",
  uploadLocal.single("file"),
  asyncHandler(async (req: Request, res: Response) => {
    const { title, policy, attributes, nomineeIds } = req.body;
    const file = req.file;
    if (!file) throw new BadRequest("File is required.");

    const userId = req.user?._id;

    // ✅ Step 1: AES Key Generation
    const aesKey = crypto.randomBytes(32); // 256-bit
    const iv = crypto.randomBytes(16); // Initialization vector for encryption

    // ✅ Step 2: Encrypt file content with AES
    const cipher = crypto.createCipheriv("aes-256-cbc", aesKey, iv);
    const input = fs.createReadStream(file.path);
    const encryptedPath = `${file.path}.enc`;
    const output = fs.createWriteStream(encryptedPath);
    input.pipe(cipher).pipe(output);
    await new Promise((resolve) => output.on("finish", resolve));

    // ✅ Step 3: Ensure RSA keys exist and encrypt AES key
    ensureRSAKeysExist();
    const publicKeyPath = path.join(__dirname, "..", "public.pem");
    let encryptedAESKey: string;

    try {
      const publicKey = fs.readFileSync(publicKeyPath, "utf8");
      const encrypted = crypto.publicEncrypt(
        {
          key: publicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        },
        aesKey
      );
      encryptedAESKey = encrypted.toString("base64");
    } catch (err: any) {
      console.error("❌ RSA encryption failed:", err.message);
      throw new BadRequest("Encryption failed. Invalid public key.");
    }

    // ✅ Step 4: Hash original file
    const fileBuffer = fs.readFileSync(file.path);
    const integrityHash = crypto
      .createHash("sha256")
      .update(fileBuffer)
      .digest("hex");

    // ✅ Step 5: Save to MongoDB with `iv`
    const will = new WillModel({
      userId,
      title,
      encryptedFilePath: encryptedPath,
      fileType: file.mimetype,
      encryptedAESKey,
      integrityHash,
      iv: iv.toString("hex"),
      attributes: JSON.parse(attributes || "[]"),
      policy,
      nomineeIds: JSON.parse(nomineeIds || "[]"),
      uploadedAt: new Date(),
    });

    await will.save();

    // ✅ Clean up original file
    fs.unlinkSync(file.path);

    res.status(201).json({
      message: "Will uploaded and encrypted successfully",
      willId: will._id,
    });
  })
);

// GET ROUTE
router.get(
  "/view-will/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const will = await WillModel.findById(id);
    if (!will) throw new NotFound("Will not found");

    const encryptedFilePath = will.encryptedFilePath;
    const encryptedAESKey = will.encryptedAESKey;
    const iv = Buffer.from(will.iv, "hex");

    // ✅ Step 1: Read private key
    const privateKeyPath = path.join(__dirname, "..", "private.pem");
    if (!fs.existsSync(privateKeyPath)) {
      throw new BadRequest("Private key not found");
    }
    const privateKey = fs.readFileSync(privateKeyPath, "utf8");

    // ✅ Step 2: Decrypt AES key
    let aesKey: Buffer;
    try {
      aesKey = crypto.privateDecrypt(
        {
          key: privateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        },
        Buffer.from(encryptedAESKey, "base64")
      );
    } catch (err: any) {
      console.error("❌ Decryption failed:", err.message);
      throw new BadRequest("Unable to decrypt AES key");
    }

    // ✅ Step 3: Stream decrypt the file and send
    const decipher = crypto.createDecipheriv("aes-256-cbc", aesKey, iv);
    const input = fs.createReadStream(encryptedFilePath);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="decrypted_${path.basename(encryptedFilePath)}"`
    );
    res.setHeader("Content-Type", will.fileType);

    input.pipe(decipher).pipe(res);
  })
);

router.get(
  "/view-wills",
  asyncHandler(async (req: Request, res: Response) => {
    const wills = await WillModel.find()
      .select("-encryptedAESKey -integrityHash -iv -encryptedFilePath")
      .populate("userId", "fullname email")
      .populate("nomineeIds", "fullname email");

    res.status(200).json({
      count: wills.length,
      data: wills,
    });
  })
);

// View will based on user id
router.get(
  "/user-wills/:userId",
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId;

    try {
      const wills = await WillModel.find({ userId: userId }).select(
        "-encryptedAESKey -integrityHash -iv -encryptedFilePath"
      ).populate("nomineeIds");

      res.status(200).json({
        count: wills.length,
        data: wills,
      });
    } catch (error) {
      res.status(500).json({
        message: "An error occurred while retrieving the wills",
        error: error,
      });
    }
  })
);

router.put(
  "/add-nominee/:willId",
  asyncHandler(async (req: Request, res: Response) => {
    const { willId } = req.params;
    const { nomineeId } = req.body;

    // ✅ Validate nomineeId
    if (!mongoose.Types.ObjectId.isValid(nomineeId)) {
      throw new BadRequest("Invalid nominee ID");
    }

    // ✅ Find the will and nominee
    const [will, nominee] = await Promise.all([
      WillModel.findById(willId),
      Nominee.findById(nomineeId),
    ]);

    if (!will) throw new NotFound("Will not found");
    if (!nominee) throw new NotFound("Nominee not found");

    // ✅ Check if nominee already exists
    const nomineeExists = will.nomineeIds
      .map((id) => id.toString())
      .includes(nomineeId);

    if (nomineeExists) {
      return res.status(200).json({ message: "Nominee already added" });
    }

    // ✅ Generate secret key for nominee
    const secretKey = crypto.randomBytes(16).toString("hex");

    // ✅ Save secret key to NomineeRequest
    const nomineeRequest = new NomineeRequest({
      nomineeId: new mongoose.Types.ObjectId(nomineeId),
      willId: new mongoose.Types.ObjectId(willId),
      secretKey, // Store initial secret key
      status: "Pending",
      requestDate: new Date(),
    });
    await nomineeRequest.save();

    // ✅ Send email with secret key (max 10 words)
    await sendSecretKeyEmail(nominee, will, secretKey);

    // ✅ Add nominee to will
    will.nomineeIds = [
      ...will.nomineeIds,
      new mongoose.Types.ObjectId(nomineeId),
    ];
    await will.save();

    res.status(200).json({
      message: "Nominee added successfully and email sent",
      updatedWill: will,
      requestId: nomineeRequest._id,
    });
  })
);

// UPDATE WILL
router.put(
  "/update-will/:willId",
  asyncHandler(async (req: Request, res: Response) => {
    const { willId } = req.params;
    const { title, policy, attributes, nomineeIds } = req.body;

    // ✅ Find the will document
    const will = await WillModel.findById(willId);
    if (!will) throw new NotFound("Will not found");

    // ✅ Validate nomineeIds if provided
    if (nomineeIds) {
      let parsedNomineeIds;
      try {
        parsedNomineeIds =
          typeof nomineeIds === "string" ? JSON.parse(nomineeIds) : nomineeIds;
      } catch {
        throw new BadRequest("Invalid JSON in nomineeIds");
      }

      if (!Array.isArray(parsedNomineeIds)) {
        throw new BadRequest("nomineeIds should be an array");
      }

      parsedNomineeIds.forEach((id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new BadRequest(`Invalid nominee ID: ${id}`);
        }
      });

      will.nomineeIds = parsedNomineeIds;
    }

    // ✅ Parse and update attributes if provided
    if (attributes) {
      let parsedAttributes;
      try {
        parsedAttributes =
          typeof attributes === "string" ? JSON.parse(attributes) : attributes;
      } catch {
        throw new BadRequest("Invalid JSON in attributes");
      }
      will.attributes = parsedAttributes;
    }

    // ✅ Update optional fields if provided
    if (title) will.title = title;
    if (policy) will.policy = policy;

    await will.save();

    res.status(200).json({
      message: "Will updated successfully",
      updatedWill: will,
    });
  })
);

router.get(
  "/nominee/getUserWillByNomineeId/:nomineeId",
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const { nomineeId } = req.params;

      // Defensive check
      if (!mongoose.Types.ObjectId.isValid(nomineeId)) {
        return res.status(400).json({ message: "Invalid nominee ID format" });
      }

      const nomineeObjectId = new mongoose.Types.ObjectId(nomineeId);

      const wills = await WillModel.find({
        nomineeIds: { $in: [nomineeObjectId] },
      })
        .populate("userId")
        .populate("nomineeIds")
        .exec();

      res.status(200).json(wills);
    } catch (error) {
      console.error("❌ Error fetching wills by nominee ID:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

// Configure multer for death certificate uploads
const deathCertStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "..", "death_certificates");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  },
});

const uploadDeathCert = multer({
  storage: deathCertStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Nominee request access with death certificate and secret key verification
router.post(
  "/nominee/request-access",
  uploadLocal.single("deathCertificate"),
  asyncHandler(async (req: Request, res: Response) => {
    const { nomineeId, willId, secretKey, proof } = req.body;
    const deathCertificateFile = req.file;

    // 1. Validate input
    if (!nomineeId || !willId || !secretKey) {
      if (deathCertificateFile) fs.unlinkSync(deathCertificateFile.path);
      throw new BadRequest("nomineeId, willId, and secretKey are required");
    }

    if (
      !mongoose.Types.ObjectId.isValid(nomineeId) ||
      !mongoose.Types.ObjectId.isValid(willId)
    ) {
      if (deathCertificateFile) fs.unlinkSync(deathCertificateFile.path);
      throw new BadRequest("Invalid ID format");
    }

    const nomineeObjectId = new mongoose.Types.ObjectId(nomineeId);
    const willObjectId = new mongoose.Types.ObjectId(willId);

    // 2. Fetch will, nominee, and existing request
    const [will, nominee, existingRequest] = await Promise.all([
      WillModel.findById(willObjectId),
      Nominee.findById(nomineeObjectId),
      NomineeRequest.findOne({ nomineeId: nomineeObjectId, willId: willObjectId }),
    ]);

    // 3. Validate resources
    if (!will) {
      if (deathCertificateFile) fs.unlinkSync(deathCertificateFile.path);
      throw new NotFound("Will not found");
    }
    if (!nominee) {
      if (deathCertificateFile) fs.unlinkSync(deathCertificateFile.path);
      throw new NotFound("Nominee not found");
    }

    // 4. Check nominee assignment
    const isAssigned = will.nomineeIds.some((id) => id.equals(nomineeObjectId));
    if (!isAssigned) {
      if (deathCertificateFile) fs.unlinkSync(deathCertificateFile.path);
      throw new Unauthorized("Not assigned as a nominee to this will");
    }

    // 5. Validate secretKey if request already exists
    if (existingRequest && existingRequest.secretKey !== secretKey) {
      if (deathCertificateFile) fs.unlinkSync(deathCertificateFile.path);
      throw new Unauthorized("Invalid secret key");
    }

    // 6. Block if already processed
    if (existingRequest && existingRequest.status !== "Pending") {
      if (deathCertificateFile) fs.unlinkSync(deathCertificateFile.path);
      return res.status(409).json({
        message: `Request already processed with status: ${existingRequest.status}`,
        requestId: existingRequest._id,
        status: existingRequest.status,
      });
    }

    // 7. Prepare file path as full URL
    const deathCertificateURL = deathCertificateFile
      ? `${CONFIG.HOST}/static/uploads/${deathCertificateFile.filename}`
      : undefined;

    // 8. Save new or update existing
    let request;

    if (existingRequest) {
      // Optional: Delete old file
      if (existingRequest.deathCertificate && fs.existsSync(existingRequest.deathCertificate)) {
        try {
          fs.unlinkSync(existingRequest.deathCertificate);
        } catch (err) {
          console.warn("Old file deletion failed:", err);
        }
      }

      existingRequest.deathCertificate = deathCertificateURL;
      existingRequest.status = "Pending";
      existingRequest.requestDate = new Date();
      await existingRequest.save();
      request = existingRequest;
    } else {
      request = new NomineeRequest({
        nomineeId: nomineeObjectId,
        willId: willObjectId,
        secretKey,
        status: "Pending",
        requestDate: new Date(),
        proof: proof || undefined,
        deathCertificate: deathCertificateURL,
        deathCertificateVerified: false,
      });
      await request.save();
    }

    // 9. Respond
    res.status(201).json({
      message: "Access request submitted successfully",
      requestId: request._id,
      deathCertificate: request.deathCertificate,
      requiresDeathCertificate: !deathCertificateFile,
      status: "Pending",
    });
  })
);

//get all requests based on nominee id
router.get("/nominee/requests/:nomineeId", async (req, res) => {
  try {
    const requests = await NomineeRequest.find({ nomineeId: req.params.nomineeId })
      .populate({
        path: "willId",
        populate: {
          path: "userId",
          select: "fullname",
        },
      })
      .sort({ requestDate: -1 }); // latest first

    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ message: "Error fetching requests", error: err });
  }
});

// Admin approval route for access request
router.put(
  "/admin/approve-request/:requestId",
  asyncHandler(async (req: Request, res: Response) => {
    const { requestId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      throw new BadRequest("Invalid request ID");
    }

    // Find the request
    const request = await NomineeRequest.findById(requestId)
      .populate("nomineeId")
      .populate("willId");
    if (!request) throw new NotFound("Request not found");

    // Verify death certificate exists
    if (!request.deathCertificate) {
      throw new BadRequest("Death certificate required for approval");
    }

    // Mark as approved and verified
    request.status = "Approved";
    request.deathCertificateVerified = true;

    // Generate new secret key for approved access
    const newSecretKey = crypto.randomBytes(16).toString("hex");
    request.secretKey = newSecretKey;
    await request.save();

    // Send approval email with new secret key (max 10 words)
    await sendSecretKeyEmail(request.nomineeId, request.willId, newSecretKey, true);

    res.status(200).json({
      message: "Request approved and new secret key sent",
      requestId: request._id,
      status: request.status,
    });
  })
);

//get admin all requests
router.get(
  "/admin/requests",
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const requests = await NomineeRequest.find()
        .populate("nomineeId", "fullname email")
        .populate("willId", "title uploadedAt");

      res.status(200).json({
        count: requests.length,
        data: requests,
      });
    } catch (err) {
      console.error("Error fetching requests:", err);
      res.status(500).json({ message: "Error fetching requests" });
    }
  })
);

const upload1 = multer({ storage: multer.memoryStorage() });

router.post(
  "/nominee/view-will/:willId",
  upload1.single("signature"),
  asyncHandler(async (req: Request, res: Response) => {
    const { willId } = req.params;
    const { nomineeId, secretKey } = req.body;
    const file = req.file;

    // === Input Validation ===
    if (!mongoose.Types.ObjectId.isValid(willId)) {
      throw new BadRequest("Invalid will ID format");
    }
    if (!nomineeId || !mongoose.Types.ObjectId.isValid(nomineeId)) {
      throw new BadRequest("Valid nomineeId is required in request body");
    }
    if (!secretKey) {
      throw new BadRequest("Secret key is required");
    }
    if (!file || !file.buffer) {
      throw new BadRequest("Signature file is missing or unreadable");
    }

    const willObjectId = new mongoose.Types.ObjectId(willId);
    const nomineeObjectId = new mongoose.Types.ObjectId(nomineeId);

    // === Check Approved Access Request ===
    const approvedRequest = await NomineeRequest.findOne({
      willId: willObjectId,
      nomineeId: nomineeObjectId,
      status: "Approved",
      secretKey,
    });

    if (!approvedRequest) {
      throw new Unauthorized("No approved access request found or invalid secret key");
    }

    if (approvedRequest.deathCertificate && !approvedRequest.deathCertificateVerified) {
      throw new Unauthorized("Death certificate verification pending");
    }

    // === Get Will and Nominee Details ===
    const [will, nominee] = await Promise.all([
      WillModel.findById(willObjectId),
      Nominee.findById(nomineeObjectId),
    ]);

    if (!will) throw new NotFound("Will not found");
    if (!nominee) throw new NotFound("Nominee not found");

    const isAssigned = will.nomineeIds.some((id) => id.equals(nomineeObjectId));
    if (!isAssigned) {
      throw new Unauthorized("Nominee no longer assigned to this will");
    }

    // === Attribute-Based Access Policy Check ===
    if (will.policy === "ATTRIBUTE_BASED") {
      const hasAttributes = checkNomineeAttributes(nominee, will);
      if (!hasAttributes) {
        throw new Unauthorized("Nominee doesn't meet access requirements");
      }
    }

    // === Signature Hash Verification with better error handling ===
    console.log("=== Signature Verification Debug ===");
    console.log("File mimetype:", file.mimetype);
    console.log("File size:", file.size);

    const uploadedHash = crypto.createHash("sha256").update(file.buffer).digest("hex");
    console.log("Uploaded file hash:", uploadedHash);
    console.log("Stored nominee sign hash:", nominee.nomineeSign);

    // Check if nominee has signature stored
    if (!nominee.nomineeSign) {
      console.error("No signature found for nominee:", nomineeId);
      throw new Unauthorized("You haven't uploaded your signature yet. Please update your signature first.");
    }

    // Verify signature
    if (uploadedHash !== nominee.nomineeSign) {
      console.error("Signature mismatch");
      console.error("Stored:", nominee.nomineeSign);
      console.error("Uploaded:", uploadedHash);
      throw new Unauthorized("Signature verification failed. Please use the correct signature file.");
    }

    console.log("✅ Signature verified successfully");

    // === Encrypted File Existence Check ===
    if (!fs.existsSync(will.encryptedFilePath)) {
      throw new NotFound("Encrypted will file not found on server");
    }

    // === Decrypt and Serve File ===
    try {
      const privateKeyPath = path.join(__dirname, "..", "private.pem");

      if (!fs.existsSync(privateKeyPath)) {
        throw new Error("Private key file not found");
      }

      const privateKey = fs.readFileSync(privateKeyPath, "utf8");

      const aesKey = crypto.privateDecrypt(
        {
          key: privateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        },
        Buffer.from(will.encryptedAESKey, "base64")
      );

      const iv = Buffer.from(will.iv, "hex");
      const decipher = crypto.createDecipheriv("aes-256-cbc", aesKey, iv);

      const encryptedData = fs.readFileSync(will.encryptedFilePath);
      const decryptedChunks = [decipher.update(encryptedData), decipher.final()];
      const decryptedData = Buffer.concat(decryptedChunks);

      const fileType = will.fileType || "application/pdf";
      const validFileTypes = ["application/pdf", "text/plain", "application/msword"];
      if (!validFileTypes.includes(fileType)) {
        throw new BadRequest("Unsupported file type");
      }

      const fileExtension = fileType.split("/")[1] || "pdf";
      const fileName = `${will.title}_${will._id}.${fileExtension}`;
      const disposition = req.query.download === "true" ? "attachment" : "inline";

      res.setHeader("Content-Type", fileType);
      res.setHeader("Content-Length", decryptedData.length);
      res.setHeader("Content-Disposition", `${disposition}; filename="${fileName}"`);
      res.send(decryptedData);

      // Update access timestamp
      await NomineeRequest.findByIdAndUpdate(approvedRequest._id, {
        lastAccessed: new Date(),
      });
    } catch (error) {
      console.error("Decryption error:", error);
      throw new BadRequest(`Failed to decrypt or process will document: ${error}`);
    }
  })
);

// ============================================
// 🔧 SIGNATURE UPDATE ENDPOINT (ADD THIS)
// ============================================
router.put(
  "/nominee/update-signature/:nomineeId",
  uploadLocal.single("signature"),
  asyncHandler(async (req: Request, res: Response) => {
    const { nomineeId } = req.params;
    const file = req.file;

    console.log("=== Update Signature Request ===");
    console.log("Nominee ID:", nomineeId);

    if (!file) {
      throw new BadRequest("Signature file is required");
    }

    // Find nominee
    const nominee = await Nominee.findById(nomineeId);
    if (!nominee) {
      throw new NotFound("Nominee not found");
    }

    // Generate SHA-256 hash from signature file
    const signatureHash = crypto
      .createHash("sha256")
      .update(file.buffer)
      .digest("hex");

    console.log("Generated signature hash:", signatureHash);

    // Update the nominee's signature hash
    nominee.nomineeSign = signatureHash;
    await nominee.save();

    res.status(200).json({
      success: true,
      message: "Signature updated successfully",
      nomineeId: nominee._id,
      hash: signatureHash
    });
  })
);

// ============================================
// 🔧 DEBUG ENDPOINT TO CHECK NOMINEE SIGNATURE (OPTIONAL - REMOVE IN PRODUCTION)
// ============================================
router.get(
  "/nominee/check-signature/:nomineeId",
  asyncHandler(async (req: Request, res: Response) => {
    const { nomineeId } = req.params;

    const nominee = await Nominee.findById(nomineeId).select("name email nomineeSign");
    if (!nominee) {
      throw new NotFound("Nominee not found");
    }

    res.status(200).json({
      id: nominee._id,
      name: nominee.username || nominee.fullname || "Unknown", email: nominee.email,
      hasSignature: !!nominee.nomineeSign,
      signatureHash: nominee.nomineeSign || "Not set"
    });
  })
);

//delete will based on user id
router.delete("/delete-will/:willId", async (req, res) => {
  const willId = req.params.willId;
  const userId = req.body.userId || req.query.userId || req.user?._id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const will = await WillModel.findById(willId);

    if (!will) {
      return res.status(404).json({ message: "Will not found" });
    }

    if (will.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this will" });
    }

    await will.deleteOne();
    res.json({ message: "Will deleted successfully" });
  } catch (error) {
    console.error("Error deleting will:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;