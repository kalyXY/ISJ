// Script pour identifier et corriger les utilisateurs enseignants orphelins
// Utilisateurs avec role="teacher" mais sans enregistrement Enseignant correspondant

async function identifyOrphanedTeachers() {
    console.log("🔍 Recherche des utilisateurs enseignants orphelins...");
    
    // Trouver tous les utilisateurs avec le rôle "teacher"
    const teacherUsers = await db.User.find({ role: "teacher" });
    console.log(`📊 Nombre total d'utilisateurs avec role="teacher": ${teacherUsers.length}`);
    
    // Trouver tous les enseignants existants
    const existingTeachers = await db.Enseignant.find({});
    const existingTeacherUserIds = new Set(existingTeachers.map(t => t.userId?.toString()).filter(Boolean));
    console.log(`📊 Nombre d'enregistrements Enseignant existants: ${existingTeachers.length}`);
    
    // Identifier les utilisateurs orphelins
    const orphanedTeachers = teacherUsers.filter(user => !existingTeacherUserIds.has(user._id.toString()));
    
    console.log(`⚠️  Utilisateurs enseignants orphelins trouvés: ${orphanedTeachers.length}`);
    
    if (orphanedTeachers.length > 0) {
        console.log("\n📋 Liste des utilisateurs orphelins:");
        orphanedTeachers.forEach((user, index) => {
            console.log(`${index + 1}. ID: ${user._id}, Email: ${user.email}, Nom: ${user.firstName} ${user.lastName}`);
        });
    }
    
    return orphanedTeachers;
}

async function fixOrphanedTeachers() {
    console.log("\n🔧 Correction des utilisateurs enseignants orphelins...");
    
    const orphanedTeachers = await identifyOrphanedTeachers();
    
    if (orphanedTeachers.length === 0) {
        console.log("✅ Aucun utilisateur orphelin à corriger.");
        return;
    }
    
    console.log("\n🎯 Options de correction:");
    console.log("1. Créer des enregistrements Enseignant pour ces utilisateurs");
    console.log("2. Changer le rôle de ces utilisateurs (par exemple vers 'admin')");
    console.log("3. Supprimer ces utilisateurs");
    
    // Option 1: Créer des enregistrements Enseignant
    console.log("\n🔨 Création des enregistrements Enseignant manquants...");
    
    for (const user of orphanedTeachers) {
        try {
            const enseignantData = {
                userId: user._id,
                nom: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email,
                email: user.email,
                assignedClassroomId: null, // Pas de salle assignée par défaut
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            const result = await db.Enseignant.insertOne(enseignantData);
            console.log(`✅ Enregistrement Enseignant créé pour ${user.email} (ID: ${result.insertedId})`);
        } catch (error) {
            console.error(`❌ Erreur lors de la création de l'enregistrement pour ${user.email}:`, error.message);
        }
    }
    
    console.log("\n✅ Correction terminée!");
}

// Option alternative: Changer le rôle des utilisateurs orphelins
async function changeOrphanedTeachersRole(newRole = 'admin') {
    console.log(`\n🔄 Changement du rôle des utilisateurs enseignants orphelins vers "${newRole}"...`);
    
    const orphanedTeachers = await identifyOrphanedTeachers();
    
    if (orphanedTeachers.length === 0) {
        console.log("✅ Aucun utilisateur orphelin à modifier.");
        return;
    }
    
    const orphanedIds = orphanedTeachers.map(user => user._id);
    
    try {
        const result = await db.User.updateMany(
            { _id: { $in: orphanedIds } },
            { $set: { role: newRole, updatedAt: new Date() } }
        );
        
        console.log(`✅ ${result.modifiedCount} utilisateurs ont été mis à jour avec le rôle "${newRole}"`);
        
        // Afficher les utilisateurs modifiés
        orphanedTeachers.forEach(user => {
            console.log(`   - ${user.email}: teacher → ${newRole}`);
        });
        
    } catch (error) {
        console.error("❌ Erreur lors de la mise à jour des rôles:", error.message);
    }
}

// Fonction principale
async function main() {
    try {
        console.log("🚀 Démarrage du script de correction des enseignants orphelins\n");
        
        // D'abord identifier le problème
        await identifyOrphanedTeachers();
        
        // Puis proposer les solutions
        console.log("\n" + "=".repeat(60));
        console.log("🛠️  SOLUTIONS DISPONIBLES:");
        console.log("=".repeat(60));
        
        console.log("\n💡 Pour corriger automatiquement (créer les enregistrements Enseignant):");
        console.log("   await fixOrphanedTeachers()");
        
        console.log("\n💡 Pour changer le rôle des utilisateurs orphelins vers 'admin':");
        console.log("   await changeOrphanedTeachersRole('admin')");
        
        console.log("\n💡 Pour changer le rôle des utilisateurs orphelins vers 'student':");
        console.log("   await changeOrphanedTeachersRole('student')");
        
        console.log("\n⚠️  RECOMMANDATION:");
        console.log("   1. Utilisez fixOrphanedTeachers() si ces utilisateurs doivent rester enseignants");
        console.log("   2. Utilisez changeOrphanedTeachersRole('admin') si vous voulez les promouvoir");
        console.log("   3. Examinez manuellement chaque cas avant de décider");
        
    } catch (error) {
        console.error("❌ Erreur fatale:", error);
    }
}

// Exécuter l'analyse
main();