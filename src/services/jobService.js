import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    getDocs,
    orderBy,
  } from 'firebase/firestore';
  import {db} from '../firebase';
  
  export const addJob = async (userId, jobData) => {
    try {
      // クライアントIDとドキュメントIDを分離するため
      const { id, ...jobDataWithoutId } = jobData;
      
      const jobCollection = collection(db, 'jobs');
      const docRef = await addDoc(jobCollection, {
        ...jobDataWithoutId,
        clientId: id, // 元のIDをclientIdとして保存
        userId,
        createdAt: new Date(),
      });
      
      // 成功したら、新しいドキュメントIDを含むオブジェクトを返す
      return {
        id: docRef.id,
        ...jobDataWithoutId,
        clientId: id,
        userId
      };
    } catch (error) {
      console.error('Error adding job:', error);
      throw error;
    }
  };
  
  export const updateJob = async (jobId, jobData) => {
    try {
      console.log('Updating job in Firestore with ID:', jobId);
      
      // idフィールドを削除（Firestoreでは不要）
      const { id, ...updateData } = jobData;
      
      // 更新日時を追加
      const dataToUpdate = {
        ...updateData,
        updatedAt: new Date()
      };
      
      console.log('Data being sent to Firestore:', dataToUpdate);
      
      // 正しいドキュメント参照を作成 - ここが重要！
      const jobDoc = doc(db, 'jobs', jobId);
      
      // ドキュメントを更新
      await updateDoc(jobDoc, dataToUpdate);
      
      console.log('Job update in Firestore successful');
      
      // 更新されたデータを返す
      return {
        id: jobId,
        ...dataToUpdate
      };
    } catch (error) {
      console.error('Error updating job in Firestore:', error);
      throw error;
    }
  };
  
  export const deleteJob = async (jobId) => {
    try {
      console.log('Deleting job with ID:', jobId);
      
      // 正しいドキュメント参照を作成
      const jobDoc = doc(db, 'jobs', jobId);
      
      // ドキュメントを削除
      await deleteDoc(jobDoc);
      
      console.log('Job deletion successful');
      return true;
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  };
  
  export const getUserJobs = async (userId) => {
    try {
      console.log('Fetching jobs for user:', userId);
      
      const jobCollection = collection(db, 'jobs');
      const q = query(
          jobCollection,
          where('userId', '==', userId),
          orderBy('createdAt', 'desc'),
      );
      
      const querySnapshot = await getDocs(q);
      const jobs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      console.log(`Retrieved ${jobs.length} jobs for user`);
      return jobs;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  };