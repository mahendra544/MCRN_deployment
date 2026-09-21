const bcrypt = require("bcryptjs");

async function main() {
  const password = "ChangeMe123!";

  const hash = await bcrypt.hash(password, 10);

  console.log("Password:", password);
  console.log("Password hash:");
  console.log(hash);
}

main();