// Firebase project configuration.
//
// Replace every placeholder below with the values from your own Firebase
// project: Firebase Console → Project settings → «Your apps» → SDK setup
// and configuration → Config. See README.md for the step-by-step guide.
//
// databaseURL is REQUIRED (Realtime Database, not Firestore). It looks like
// https://<project-id>-default-rtdb.<region>.firebasedatabase.app or, for
// older US projects, https://<project-id>-default-rtdb.firebaseio.com

export const firebaseConfig = {
  apiKey: "AIzaSyAQp2gd5-dsk88TDaYmcVUX_-FKTq8fSQY",
  authDomain: "live-schedule-33a34.firebaseapp.com",
  databaseURL: "https://live-schedule-33a34-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "live-schedule-33a34",
  storageBucket: "live-schedule-33a34.firebasestorage.app",
  messagingSenderId: "202809875744",
  appId: "1:202809875744:web:4803590ecdecc132394b45"
};

// Realtime Database path under which the whole schedule document
// (categories, events, nameColors) is stored.
export const SCHEDULE_PATH = "schedule";
