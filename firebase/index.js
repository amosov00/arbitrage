const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

async function getAllWorkers() {
    const snapshot = await db.collection('p2p_buy-workers').get()
    return snapshot.docs.map(doc => doc.data())
}

async function setWorker(amount, procent, chatId) {
    await db.collection('p2p_buy-workers').add({amount, procent, chatId});
}

async function removeAllWorkers(chatId) {
    const snapshot = await db.collection('p2p_buy-workers').get()
    const filteredWorkers = snapshot.docs.filter(doc => doc.data().chatId === chatId)
    const workersId = filteredWorkers.map(doc => doc.id)
    if (workersId.length !== 0) {
        workersId.map(async (item)=>{
            await db.collection('p2p_buy-workers').doc(item).delete();
        })
    }
}

module.exports = {getAllWorkers, setWorker, removeAllWorkers}
