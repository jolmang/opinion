import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, doc, getDoc, deleteDoc } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAzRwYWMjuEw4Jgw_7GO3oe_R_iSAMf-mY",
  authDomain: "chatting-3-dd673.firebaseapp.com",
  projectId: "chatting-3-dd673",
  storageBucket: "chatting-3-dd673.appspot.com",
  messagingSenderId: "744583620806",
  appId: "1:744583620806:web:56b003eddd20a373fb8fc7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const topicTitle = document.getElementById('topic-title');
const commentsList = document.getElementById('comments-list');
const commentInput = document.getElementById('comment-input');
const addCommentBtn = document.getElementById('add-comment-btn');
const backBtn = document.getElementById('back-btn');

const urlParams = new URLSearchParams(window.location.search);
const topicId = urlParams.get('topicId');

// Fetch and display topic title
const topicRef = doc(db, "topics", topicId);
getDoc(topicRef).then(docSnap => {
    if (docSnap.exists()) {
        topicTitle.textContent = docSnap.data().name;
    }
});

// Go back to the main page
backBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Fetch and display comments
const commentsRef = collection(db, "topics", topicId, "comments");
onSnapshot(commentsRef, (snapshot) => {
    commentsList.innerHTML = '';
    snapshot.forEach(doc => {
        const comment = doc.data();
        const commentId = doc.id;
        const li = document.createElement('li');

        const commentText = document.createElement('span');
        commentText.textContent = comment.text;
        li.appendChild(commentText);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-comment-btn';
        deleteBtn.textContent = 'x';
        deleteBtn.addEventListener('click', async () => {
            await deleteDoc(doc.ref);
        });
        li.appendChild(deleteBtn);

        commentsList.appendChild(li);
    });
});

// Add a new comment
addCommentBtn.addEventListener('click', async () => {
    const commentText = commentInput.value;
    if (commentText) {
        await addDoc(commentsRef, { text: commentText });
        commentInput.value = '';
    }
});