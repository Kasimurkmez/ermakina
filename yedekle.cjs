const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Dosya adının tam doğru olduğundan emin ol
const serviceAccount = require('./servis-hesabi.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function runBackup() {
  try {
    const snapshot = await db.collection('fixtures').get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const backupDir = path.join(__dirname, 'yerel_yedekler');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);
    const fileName = `yedek_${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(path.join(backupDir, fileName), JSON.stringify(data, null, 2));
    console.log("Yedekleme basarili.");
  } catch (error) {
    console.error('Yedekleme hatasi (Sistem calismaya devam edecek):', error.message);
  } finally {
    process.exit(0);
  }
}
runBackup();