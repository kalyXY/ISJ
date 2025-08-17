// Script de test pour vérifier les imports
const { execSync } = require('child_process');

try {
  console.log('🔍 Vérification des imports...');
  
  // Test de compilation TypeScript
  execSync('npx tsc --noEmit --project apps/web/tsconfig.json', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('✅ Tous les imports sont corrects !');
} catch (error) {
  console.error('❌ Erreurs d\'import détectées :', error.message);
  process.exit(1);
}

