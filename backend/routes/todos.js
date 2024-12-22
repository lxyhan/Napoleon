const express = require("express");
const { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } = require("firebase/firestore");
const { initializeApp } = require("firebase/app");

const router = express.Router();

// Firebase configuration (replace with your Firebase config)
const firebaseConfig = {
    apiKey: "AIzaSyD1d9d0kxhm1SnNUK67DPD0-VsMszyeu6g",
    authDomain: "napoleon-c94b4.firebaseapp.com",
    projectId: "napoleon-c94b4",
    storageBucket: "napoleon-c94b4.firebasestorage.app",
    messagingSenderId: "491794082949",
    appId: "1:491794082949:web:11e4cde45b8cd4bf30cdec",
    measurementId: "G-NJ37B6NSEK"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Firestore collection reference
const todosCollection = collection(db, "todos");

// GET all todos
router.get("/", async (req, res) => {
  try {
    const querySnapshot = await getDocs(todosCollection);
    const todos = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ message: "Failed to fetch todos" });
  }
});

// POST a new todo
router.post("/", async (req, res) => {
  const { name, dueDate, description, estimatedTime, priority } = req.body;
  try {
    const newTodo = { name, dueDate, description, estimatedTime, priority };
    const docRef = await addDoc(todosCollection, newTodo);
    res.status(201).json({ id: docRef.id, ...newTodo });
  } catch (error) {
    console.error("Error adding todo:", error);
    res.status(500).json({ message: "Failed to add todo" });
  }
});

// DELETE a todo
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await deleteDoc(doc(db, "todos", id));
    res.status(204).send(); // No content response
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ message: "Failed to delete todo" });
  }
});

module.exports = router;
