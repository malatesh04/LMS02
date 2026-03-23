import React, { createContext, useState, useEffect } from 'react';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Fetch user role & data from Firestore
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                const userDoc = await getDoc(userDocRef);
                
                if (userDoc.exists()) {
                    setUser({ uid: firebaseUser.uid, ...userDoc.data() });
                } else {
                    // Fallback if they somehow authenticated without a Firestore doc
                    setUser({
                        uid: firebaseUser.uid,
                        name: firebaseUser.displayName || 'User',
                        email: firebaseUser.email,
                        role: 'student' 
                    });
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const loginEmail = async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    };

    const signupEmail = async (name, email, password, role) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        
        // Save to Firestore
        await setDoc(doc(db, 'users', newUser.uid), {
            name,
            email,
            role,
            status: 'approved',
            created_at: new Date().toISOString()
        });
        
        return newUser;
    };

    const logoutUser = async () => {
        try { await signOut(auth); } catch (_) {}
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            loginEmail, 
            signupEmail, 
            logout: logoutUser 
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
