import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseApp from '@/firebase';

const createAdminUser = async () => {
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

  const email = process.env.NEXT_PUBLIC_ADMIN_MAIL;
  const password = process.env.NEXT_PUBLIC_ADMIN_PASS;

  try {
    // Check if already signed in with that email
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save admin role in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email,
      role: 'admin',
      createdAt: new Date(),
    });

    console.log('✅ Admin created successfully.');
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      console.log('⚠️ Admin already exists.');
    } else {
      console.error('❌ Error creating admin:', err.message);
    }
  }
};

export default createAdminUser;
