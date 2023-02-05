import { getDoc, doc } from "firebase/firestore";

export async function completeQuery(db, querySnapshot, toComplete) {
    const wait = querySnapshot.docs.map(async (i) => {
        const data = i.data();
        for (let j of toComplete) {
            let [key, collection] = j;
            let id = data[key];
            if (!id) continue;
            let ref = await getDoc(doc(db, collection, id));
            if (ref.exists()) {
                data[key] = ref.data();
                data[key].id = id;
            } else {
                delete data[key];
            }
        }
        data.id = i.id;
        return data;
    });
    return Promise.all(wait);
}