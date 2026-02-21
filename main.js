import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc } from 'firebase/firestore';

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

const topicInput = document.getElementById('topic-input');
const passwordInput = document.getElementById('password-input');
const addTopicBtn = document.getElementById('add-topic-btn');
const topicsList = document.getElementById('topics-list');
const loginBtn = document.getElementById('login-btn');

// Go to login page
loginBtn.addEventListener('click', () => {
    window.location.href = 'login.html';
});

// Add a new topic
addTopicBtn.addEventListener('click', async () => {
    const topicName = topicInput.value;
    const password = passwordInput.value;
    if (topicName && password) {
        await addDoc(collection(db, 'topics'), {
            name: topicName,
            password: password
        });
        topicInput.value = '';
        passwordInput.value = '';
    }
});

// Display topics
onSnapshot(collection(db, 'topics'), (snapshot) => {
    topicsList.innerHTML = '';
    snapshot.forEach(doc => {
        const topic = doc.data();
        const topicId = doc.id;
        const topicCard = document.createElement('div');
        topicCard.className = 'topic-card';

        const topicNameEl = document.createElement('h2');
        topicNameEl.textContent = topic.name;
        topicCard.appendChild(topicNameEl);

        topicCard.addEventListener('click', () => {
            window.open(`comments.html?topicId=${topicId}`, '_blank');
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '삭제';
        deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation(); // Prevent opening comments page
            const password = prompt('비밀번호를 입력하세요:');
            if (password === topic.password) {
                await deleteDoc(doc.ref);
            }
        });
        topicCard.appendChild(deleteBtn);

        topicsList.appendChild(topicCard);
    });
});