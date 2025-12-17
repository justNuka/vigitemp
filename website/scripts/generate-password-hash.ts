/**
 * Script pour générer un hash bcrypt d'un mot de passe
 * Usage: npx tsx scripts/generate-password-hash.ts "password_a_hasher"
 */

import bcrypt from "bcryptjs";

async function main() {
  const password = process.argv[2];
  
  if (!password) {
    console.error("❌ Erreur: Veuillez fournir un mot de passe");
    console.log("Usage: npx tsx scripts/generate-password-hash.ts \"Test123!\"");
    process.exit(1);
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log("\n✅ Hash généré avec succès:\n");
    console.log(`Mot de passe: ${password}`);
    console.log(`Hash bcrypt: ${hashedPassword}`);
    console.log("\n📋 Copie ce hash pour l'insérer dans la BD:");
    console.log(`UPDATE t_utilisateur SET Mot_de_passe = '${hashedPassword}' WHERE Login = 'EBO';\n`);
  } catch (error) {
    console.error("❌ Erreur lors du hashage:", error);
    process.exit(1);
  }
}

main();
