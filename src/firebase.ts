import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyAlonKAsSo5ccwBYALXIsJPjhG5RN3kbSk",
  authDomain: "music-club-booking.firebaseapp.com",
  databaseURL: "https://music-club-booking-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "music-club-booking",
  storageBucket: "music-club-booking.firebasestorage.app",
  messagingSenderId: "83157387295",
  appId: "1:83157387295:web:31a932099560215cdf6d2a"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getDatabase(app)
export const googleProvider = new GoogleAuthProvider()

googleProvider.setCustomParameters({ prompt: 'select_account' })
