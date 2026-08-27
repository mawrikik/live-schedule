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

// Realtime Database node holding the whole schedule document (categories,
// events, nameColors).
//
// Each signed-in user edits their OWN node: the board binds to the path mapped
// to their Firebase Auth uid below. Anyone not listed here — including visitors
// who are not signed in — sees DEFAULT_SCHEDULE_PATH (read-only unless the
// database rules also grant them write on it).
//
// The Realtime Database rules must grant each uid write access to its node,
// e.g. /schedule → uid A, /schedule-2 → uid B.
export const DEFAULT_SCHEDULE_PATH = "schedule";
export const SCHEDULE_PATH_BY_UID = {
  "xTdhyN3sz5UX95EtIofIrX8Zjmg1": "schedule",
  "z0bozaNZGIRn1f3sLazfCk9hff02": "schedule-2"
};
