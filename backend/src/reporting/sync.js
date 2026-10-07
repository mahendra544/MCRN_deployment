const db = require("../db");
const { ensurePoliceSchema } = require("../police/schema");

async function syncReport({
  userId,
  reportId,
  caseNumber,
  childName,
  age,
  gender,
  location,
  dateMissing,
  timeMissing,
  photo,
  parentName,
  parentPhone,
  parentEmail,
  address,
  height,
  weight,
  complexion,
  identifyingMarks,
  clothingDescription,
  additionalInformation
}) {
  await ensurePoliceSchema(db);

  await db.query(
    `INSERT INTO children (case_id, name, age, gender, location, date_missing, status, sighted, photo, owner_user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     ON CONFLICT (case_id) DO UPDATE SET
       name = EXCLUDED.name,
       age = EXCLUDED.age,
       gender = EXCLUDED.gender,
       location = EXCLUDED.location,
       date_missing = EXCLUDED.date_missing,
       photo = EXCLUDED.photo`,
    [
      caseNumber,
      childName,
      Number(age),
      gender,
      location,
      dateMissing,
      "Missing",
      0,
      photo || null,
      String(userId)
    ]
  );

  await db.query(
    `INSERT INTO missing_cases (
       case_number, child_name, child_age, gender, last_seen_location, last_seen_datetime,
       case_stage, status, filed_by, assigned_officer, parent_name, parent_phone, parent_email,
       address, height, weight, complexion, identifying_marks, clothing_description,
       additional_information, photo
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
     ON CONFLICT (case_number) DO UPDATE SET
       child_name = EXCLUDED.child_name,
       child_age = EXCLUDED.child_age,
       gender = EXCLUDED.gender,
       last_seen_location = EXCLUDED.last_seen_location,
       last_seen_datetime = EXCLUDED.last_seen_datetime,
       parent_name = EXCLUDED.parent_name,
       parent_phone = EXCLUDED.parent_phone,
       parent_email = EXCLUDED.parent_email,
       address = EXCLUDED.address,
       height = EXCLUDED.height,
       weight = EXCLUDED.weight,
       complexion = EXCLUDED.complexion,
       identifying_marks = EXCLUDED.identifying_marks,
       clothing_description = EXCLUDED.clothing_description,
       additional_information = EXCLUDED.additional_information,
       photo = EXCLUDED.photo`,
    [
      caseNumber,
      childName,
      Number(age),
      gender,
      location,
      `${dateMissing} ${timeMissing || "00:00:00"}`,
      "Open",
      "Pending Verification",
      String(userId),
      null,
      parentName || null,
      parentPhone || null,
      parentEmail || null,
      address || null,
      height || null,
      weight || null,
      complexion || null,
      identifyingMarks || null,
      clothingDescription || null,
      additionalInformation || null,
      photo || null
    ]
  );
}

module.exports = { syncReport };
