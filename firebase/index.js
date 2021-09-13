const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

async function getAllWorkers() {
    const p2pWorkers = await db.collection('p2p_buy-workers').get()
    const cakeWorkers = await db.collection('cake-workers').get()
    p2pWorkers.docs.map(doc => doc.data())
    cakeWorkers.docs.map(doc => doc.data())
    return {
        p2pWorkers: p2pWorkers.docs.map(doc => doc.data()),
        cakeWorkers: cakeWorkers.docs.map(doc => doc.data())
    }
}

async function setWorker(amount, procent, chatId, collection) {
    await db.collection(collection).add({amount, procent, chatId});
}

async function removeAllWorkers(chatId) {
    const collections = ['p2p_buy-workers', 'cake-workers']
    collections.map(async (collection)=>{
        const snapshot = await db.collection(collection).get()
        const filteredWorkers = snapshot.docs.filter(doc => doc.data().chatId === chatId)
        const workersId = filteredWorkers.map(doc => doc.id)
        if (workersId.length !== 0) {
            workersId.map(async (item)=>{
                await db.collection(collection).doc(item).delete();
            })
        }
        return collection
    })
}

module.exports = {getAllWorkers, setWorker, removeAllWorkers}
