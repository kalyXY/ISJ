import htmlToPdf from 'html-pdf-node';

// Configuration par défaut pour la génération PDF
const pdfOptions = {
  format: 'A4',
  margin: {
    top: '20mm',
    bottom: '20mm',
    left: '15mm',
    right: '15mm'
  },
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: '<div></div>',
  footerTemplate: `
    <div style="font-size: 10px; width: 100%; text-align: center; margin: 0 15mm;">
      <span>École Saint Joseph - Bulletin scolaire - Page <span class="pageNumber"></span> / <span class="totalPages"></span></span>
    </div>
  `,
  timeout: 30000
};

// Template HTML pour le bulletin
function genererTemplateHTML(donnees: any): string {
  const {
    student,
    periode,
    classe,
    notes,
    moyenneGenerale,
    rangClasse,
    statistiquesClasse,
    appreciation
  } = donnees;

  // Regrouper les notes par matière
  const notesByMatiere = notes.reduce((acc: any, note: any) => {
    const matiereId = note.matiereId;
    if (!acc[matiereId]) {
      acc[matiereId] = {
        matiere: note.matiere,
        notes: [],
        moyenne: 0
      };
    }
    acc[matiereId].notes.push(note);
    return acc;
  }, {});

  // Calculer la moyenne par matière
  Object.keys(notesByMatiere).forEach(matiereId => {
    const matiereData = notesByMatiere[matiereId];
    let totalPoints = 0;
    let totalCoefficients = 0;
    
    matiereData.notes.forEach((note: any) => {
      totalPoints += note.valeur * note.coefficient;
      totalCoefficients += note.coefficient;
    });
    
    matiereData.moyenne = totalCoefficients > 0 
      ? Math.round((totalPoints / totalCoefficients) * 100) / 100 
      : 0;
  });

  const matieres = Object.values(notesByMatiere);

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bulletin - ${student.firstName} ${student.lastName}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #333;
          background: white;
        }
        
        .bulletin-container {
          max-width: 100%;
          margin: 0 auto;
          background: white;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #2c5e82;
          padding-bottom: 20px;
        }
        
        .logo-section {
          margin-bottom: 15px;
        }
        
        .school-name {
          font-size: 24px;
          font-weight: bold;
          color: #2c5e82;
          margin-bottom: 5px;
        }
        
        .school-address {
          font-size: 11px;
          color: #666;
          margin-bottom: 15px;
        }
        
        .bulletin-title {
          font-size: 18px;
          font-weight: bold;
          color: #1a472a;
          margin-bottom: 10px;
        }
        
        .periode-info {
          font-size: 14px;
          color: #555;
        }
        
        .student-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 25px;
          padding: 15px;
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
        }
        
        .student-details, .class-details {
          flex: 1;
        }
        
        .student-details h3, .class-details h3 {
          font-size: 14px;
          color: #2c5e82;
          margin-bottom: 8px;
          border-bottom: 1px solid #dee2e6;
          padding-bottom: 3px;
        }
        
        .info-line {
          margin-bottom: 4px;
          font-size: 12px;
        }
        
        .info-label {
          font-weight: bold;
          color: #555;
        }
        
        .notes-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 25px;
          border: 1px solid #dee2e6;
        }
        
        .notes-table th {
          background: #2c5e82;
          color: white;
          padding: 12px 8px;
          text-align: left;
          font-weight: bold;
          font-size: 11px;
          border: 1px solid #1a472a;
        }
        
        .notes-table td {
          padding: 10px 8px;
          border: 1px solid #dee2e6;
          font-size: 11px;
        }
        
        .notes-table tbody tr:nth-child(even) {
          background: #f8f9fa;
        }
        
        .notes-table tbody tr:hover {
          background: #e3f2fd;
        }
        
        .matiere-name {
          font-weight: bold;
          color: #2c5e82;
        }
        
        .note-value {
          text-align: center;
          font-weight: bold;
        }
        
        .note-excellent {
          color: #28a745;
        }
        
        .note-good {
          color: #007bff;
        }
        
        .note-average {
          color: #ffc107;
        }
        
        .note-poor {
          color: #dc3545;
        }
        
        .moyenne-cell {
          background: #e8f5e8 !important;
          font-weight: bold;
          color: #1a472a;
          text-align: center;
        }
        
        .summary-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 25px;
          gap: 20px;
        }
        
        .summary-box {
          flex: 1;
          padding: 15px;
          border: 2px solid #dee2e6;
          border-radius: 8px;
          text-align: center;
        }
        
        .summary-box.moyenne {
          border-color: #28a745;
          background: #f8fff8;
        }
        
        .summary-box.rang {
          border-color: #007bff;
          background: #f8fcff;
        }
        
        .summary-title {
          font-size: 13px;
          font-weight: bold;
          color: #555;
          margin-bottom: 8px;
        }
        
        .summary-value {
          font-size: 20px;
          font-weight: bold;
          color: #2c5e82;
        }
        
        .summary-detail {
          font-size: 10px;
          color: #666;
          margin-top: 5px;
        }
        
        .statistics-section {
          margin-bottom: 25px;
          padding: 15px;
          background: #f8f9fa;
          border-left: 4px solid #2c5e82;
        }
        
        .statistics-title {
          font-size: 14px;
          font-weight: bold;
          color: #2c5e82;
          margin-bottom: 10px;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }
        
        .stat-item {
          text-align: center;
        }
        
        .stat-value {
          font-size: 16px;
          font-weight: bold;
          color: #1a472a;
        }
        
        .stat-label {
          font-size: 10px;
          color: #666;
          margin-top: 2px;
        }
        
        .appreciation-section {
          margin-bottom: 25px;
          padding: 15px;
          border: 1px solid #dee2e6;
          border-radius: 8px;
        }
        
        .appreciation-title {
          font-size: 14px;
          font-weight: bold;
          color: #2c5e82;
          margin-bottom: 10px;
        }
        
        .appreciation-text {
          font-size: 12px;
          line-height: 1.6;
          color: #555;
          font-style: italic;
          min-height: 60px;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 4px;
        }
        
        .signature-section {
          display: flex;
          justify-content: space-between;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
        }
        
        .signature-box {
          text-align: center;
          width: 30%;
        }
        
        .signature-title {
          font-size: 11px;
          font-weight: bold;
          color: #555;
          margin-bottom: 40px;
        }
        
        .signature-line {
          border-top: 1px solid #333;
          margin-top: 40px;
        }
        
        .footer-info {
          text-align: center;
          margin-top: 30px;
          font-size: 10px;
          color: #666;
        }
        
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          
          .bulletin-container {
            margin: 0;
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="bulletin-container">
        <!-- En-tête -->
        <div class="header">
          <div class="logo-section">
            <div class="school-name">École Saint Joseph (ISJ)</div>
            <div class="school-address">
              Adresse de l'école • Téléphone: +243 XXX XXX XXX • Email: contact@isj-school.cd
            </div>
          </div>
          <div class="bulletin-title">BULLETIN SCOLAIRE</div>
          <div class="periode-info">${periode.nom} - ${periode.anneeScolaire.nom}</div>
        </div>
        
        <!-- Informations élève -->
        <div class="student-info">
          <div class="student-details">
            <h3>Informations de l'élève</h3>
            <div class="info-line">
              <span class="info-label">Nom complet:</span> ${student.firstName} ${student.lastName}
            </div>
            <div class="info-line">
              <span class="info-label">Matricule:</span> ${student.matricule}
            </div>
            <div class="info-line">
              <span class="info-label">Genre:</span> ${student.gender}
            </div>
            <div class="info-line">
              <span class="info-label">Date de naissance:</span> ${new Date(student.birthDate).toLocaleDateString('fr-FR')}
            </div>
          </div>
          <div class="class-details">
            <h3>Informations de classe</h3>
            <div class="info-line">
              <span class="info-label">Classe:</span> ${classe.nom}
            </div>
            ${classe.section ? `
            <div class="info-line">
              <span class="info-label">Section:</span> ${classe.section.nom}
            </div>
            ` : ''}
            ${classe.option ? `
            <div class="info-line">
              <span class="info-label">Option:</span> ${classe.option.nom}
            </div>
            ` : ''}
            <div class="info-line">
              <span class="info-label">Année scolaire:</span> ${periode.anneeScolaire.nom}
            </div>
          </div>
        </div>
        
        <!-- Tableau des notes -->
        <table class="notes-table">
          <thead>
            <tr>
              <th>Matière</th>
              <th>Notes obtenues</th>
              <th>Coefficients</th>
              <th>Moyenne</th>
              <th>Appréciation</th>
            </tr>
          </thead>
          <tbody>
            ${matieres.map((matiereData: any) => `
              <tr>
                <td class="matiere-name">${matiereData.matiere.nom}</td>
                <td>
                  ${matiereData.notes.map((note: any) => `
                    <span class="note-value ${getNoteClass(note.valeur)}">${note.valeur}/20</span>
                  `).join(' • ')}
                </td>
                <td style="text-align: center;">
                  ${matiereData.notes.map((note: any) => note.coefficient).join(' • ')}
                </td>
                <td class="moyenne-cell">${matiereData.moyenne}/20</td>
                <td style="font-size: 10px;">
                  ${getAppreciationNote(matiereData.moyenne)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <!-- Résumé -->
        <div class="summary-section">
          <div class="summary-box moyenne">
            <div class="summary-title">Moyenne Générale</div>
            <div class="summary-value">${moyenneGenerale}/20</div>
            <div class="summary-detail">${getAppreciationNote(moyenneGenerale)}</div>
          </div>
          <div class="summary-box rang">
            <div class="summary-title">Rang dans la classe</div>
            <div class="summary-value">${rangClasse}${getOrdinalSuffix(rangClasse)}</div>
            <div class="summary-detail">sur ${statistiquesClasse.nombreEleves} élèves</div>
          </div>
        </div>
        
        <!-- Statistiques de classe -->
        <div class="statistics-section">
          <div class="statistics-title">Statistiques de la classe</div>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">${statistiquesClasse.moyenneClasse}/20</div>
              <div class="stat-label">Moyenne de classe</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${statistiquesClasse.meilleureNote}/20</div>
              <div class="stat-label">Meilleure moyenne</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${statistiquesClasse.plusBasseNote}/20</div>
              <div class="stat-label">Plus basse moyenne</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${statistiquesClasse.nombreEleves}</div>
              <div class="stat-label">Nombre d'élèves</div>
            </div>
          </div>
        </div>
        
        <!-- Appréciation générale -->
        <div class="appreciation-section">
          <div class="appreciation-title">Appréciation générale du conseil de classe</div>
          <div class="appreciation-text">
            ${appreciation || 'Aucune appréciation renseignée.'}
          </div>
        </div>
        
        <!-- Signatures -->
        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-title">Directeur des études</div>
            <div class="signature-line"></div>
          </div>
          <div class="signature-box">
            <div class="signature-title">Titulaire de classe</div>
            <div class="signature-line"></div>
          </div>
          <div class="signature-box">
            <div class="signature-title">Signature des parents</div>
            <div class="signature-line"></div>
          </div>
        </div>
        
        <!-- Pied de page -->
        <div class="footer-info">
          Bulletin généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
        </div>
      </div>
    </body>
    </html>
  `;
}

// Fonction utilitaire pour obtenir la classe CSS selon la note
function getNoteClass(note: number): string {
  if (note >= 16) return 'note-excellent';
  if (note >= 14) return 'note-good';
  if (note >= 10) return 'note-average';
  return 'note-poor';
}

// Fonction utilitaire pour obtenir l'appréciation selon la note
function getAppreciationNote(note: number): string {
  if (note >= 16) return 'Excellent';
  if (note >= 14) return 'Très bien';
  if (note >= 12) return 'Bien';
  if (note >= 10) return 'Assez bien';
  if (note >= 8) return 'Passable';
  return 'Insuffisant';
}

// Fonction utilitaire pour obtenir le suffixe ordinal
function getOrdinalSuffix(num: number): string {
  if (num === 1) return 'er';
  return 'ème';
}

// Fonction principale pour générer le PDF
export async function genererBulletinPDF(donneesBulletin: any): Promise<Buffer> {
  try {
    const htmlContent = genererTemplateHTML(donneesBulletin);
    
    const file = { content: htmlContent };
    const options = pdfOptions;
    
    const pdfBuffer = await htmlToPdf.generatePdf(file, options);
    
    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw new Error('Impossible de générer le bulletin PDF');
  }
}

// Fonction pour générer plusieurs bulletins en un seul PDF
export async function genererBulletinsClassePDF(bulletins: any[]): Promise<Buffer> {
  try {
    const bulletinsHTML = bulletins.map(bulletin => 
      genererTemplateHTML(bulletin) + '<div style="page-break-after: always;"></div>'
    ).join('');
    
    const finalHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Bulletins de classe</title>
      </head>
      <body>
        ${bulletinsHTML}
      </body>
      </html>
    `;
    
    const file = { content: finalHTML };
    const options = {
      ...pdfOptions,
      footerTemplate: `
        <div style="font-size: 10px; width: 100%; text-align: center; margin: 0 15mm;">
          <span>École Saint Joseph - Bulletins de classe - Page <span class="pageNumber"></span> / <span class="totalPages"></span></span>
        </div>
      `
    };
    
    const pdfBuffer = await htmlToPdf.generatePdf(file, options);
    
    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('Erreur lors de la génération du PDF de classe:', error);
    throw new Error('Impossible de générer les bulletins PDF de classe');
  }
}