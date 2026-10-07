const dns = require("node:dns");
if (dns && dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}
const path = require("path");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });

const SUPABASE_URL = process.env.SUPABASE_URL || "https://oiyckfwjescfzcokjnpf.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || "";
const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || "missing-child-images";

let supabase = null;

if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    console.log("Supabase client initialized for storage bucket:", BUCKET_NAME);
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err.message);
  }
} else {
  console.warn("Supabase credentials not fully configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
}

/**
 * Validates image file type and size.
 */
function validateImageFile(file) {
  if (!file) {
    throw new Error("No image file provided.");
  }

  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error("Invalid image format. Allowed formats: JPG, JPEG, PNG, WEBP.");
  }

  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
  if (file.size && file.size > MAX_SIZE) {
    throw new Error("Image file exceeds the 5MB size limit.");
  }

  return true;
}

/**
 * Generates a clean, unique, and safe storage path.
 * Format: user-id/reports/timestamp-random-name.ext
 */
function generateUniquePath({ userId = "anonymous", prefix = "reports", originalname = "image.jpg" }) {
  const ext = (path.extname(originalname) || ".jpg").toLowerCase().replace(/[^a-z0-9.]/g, "");
  const safeExt = [".jpg", ".jpeg", ".png", ".webp"].includes(ext) ? ext : ".jpg";
  const timestamp = Date.now();
  const randomHex = crypto.randomBytes(6).toString("hex");
  const safeUserId = String(userId).replace(/[^a-zA-Z0-9_-]/g, "") || "user";
  const safePrefix = String(prefix).replace(/[^a-zA-Z0-9_-]/g, "") || "reports";

  return `${safeUserId}/${safePrefix}/${timestamp}-${randomHex}${safeExt}`;
}

/**
 * Ensures the target Supabase Storage bucket exists.
 */
async function ensureBucketExists() {
  if (!supabase) return false;
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.warn("Could not list Supabase buckets:", error.message);
      return false;
    }

    const exists = (buckets || []).some((b) => b.name === BUCKET_NAME || b.id === BUCKET_NAME);
    if (!exists) {
      const { error: createErr } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 5242880,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/jpg"]
      });
      if (createErr) {
        console.warn(`Could not create bucket '${BUCKET_NAME}':`, createErr.message);
        return false;
      }
      console.log(`Created Supabase Storage bucket: ${BUCKET_NAME}`);
    }
    return true;
  } catch (err) {
    console.warn("ensureBucketExists error:", err.message);
    return false;
  }
}

/**
 * Uploads an image buffer to Supabase Storage and returns the public or signed URL.
 */
async function uploadChildImage(file, { userId = "user", reportId = null } = {}) {
  validateImageFile(file);

  if (!supabase) {
    console.error("Supabase Storage client is not configured. Missing credentials.");
    throw new Error("Storage service is not configured. Please check Supabase credentials.");
  }

  const storagePath = generateUniquePath({
    userId,
    prefix: reportId ? `report-${reportId}` : "reports",
    originalname: file.originalname || "child.jpg"
  });

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) {
    console.error("Supabase Storage upload error:", error.message);
    throw new Error("Image upload failed");
  }

  // Obtain public URL for storage in PostgreSQL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath);

  if (!urlData || !urlData.publicUrl) {
    throw new Error("Failed to generate image URL from Supabase Storage.");
  }

  return urlData.publicUrl;
}

/**
 * Resolves a stored photo reference into a full viewable URL.
 */
async function resolvePhotoUrl(photoRef, expiresIn = 3600) {
  if (!photoRef) return null;

  // Already a full HTTPS URL
  if (photoRef.startsWith("http://") || photoRef.startsWith("https://")) {
    return photoRef;
  }

  // If stored as a relative Supabase Storage path
  if (supabase && !photoRef.startsWith("/")) {
    try {
      const { data: signedData, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(photoRef, expiresIn);

      if (!error && signedData && signedData.signedUrl) {
        return signedData.signedUrl;
      }
    } catch (_) {}

    const { data: pubData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(photoRef);

    if (pubData && pubData.publicUrl) {
      return pubData.publicUrl;
    }
  }

  return photoRef;
}

module.exports = {
  supabase,
  BUCKET_NAME,
  uploadChildImage,
  validateImageFile,
  resolvePhotoUrl,
  ensureBucketExists
};
