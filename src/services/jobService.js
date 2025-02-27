import { 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    query, 
    where, 
    getDocs,
    orderBy
  } from 'firebase/firestore';
  import { db } from '../firebase';
  
  export const addJob = async (userId, jobData) => {
    try {
      const jobCollection = collection(db, 'jobs');
      return await addDoc(jobCollection, {
        ...jobData,
        userId,
        createdAt: new Date()
      });
    } catch (error) {
      console.error("Error adding job:", error);
      throw error;
    }
  };
  
  export const updateJob = async (jobId, jobData) => {
    try {
      console.log('Updating job in Firestore');
      console.log('Job ID:', jobId);
      console.log('omgggggggg');
      
      // idフィールドを削除（Firestoreでは不要）
      const updateData = jobData;
      
      console.log('Updated Job Data:', updateData);
  
      const jobDoc = doc(db, 'jobs', "GzAxleTc26PF7PAHTcdt");
      console.log('Job Document:', jobDoc);
      await updateDoc(jobDoc, updateData);
      
      console.log('Job update in Firestore successful');
      return jobId.toString();
    } catch (error) {
      console.error("Error updating job in Firestore:", error);
      throw error;
    }
  };
  
  export const deleteJob = async (jobId) => {
    try {
      const jobDoc = doc(db, 'jobs', jobId.toString());
      await deleteDoc(jobDoc);
    } catch (error) {
      console.error("Error deleting job:", error);
      throw error;
    }
  };
  
  export const getUserJobs = async (userId) => {
    try {
      const jobCollection = collection(db, 'jobs');
      const q = query(
        jobCollection, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error fetching jobs:", error);
      throw error;
    }
  };