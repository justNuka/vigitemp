// Script Node.js pour générer un hash bcrypt
const bcrypt = require('bcryptjs');

const password = 'Test123!'; // Mot de passe temporaire
const hash = bcrypt.hashSync(password, 10);

console.log('========================================');
console.log('Mot de passe temporaire pour admin:');
console.log('========================================');
console.log('Mot de passe:', password);
console.log('Hash bcrypt:', hash);
console.log('========================================');
console.log('');
console.log('SQL pour mettre à jour un utilisateur:');
console.log(`UPDATE t_utilisateur SET Mot_de_passe = '${hash}', MotDePasseTemporaire = TRUE WHERE Login = 'admin';`);
