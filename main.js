import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

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

// Add a new topic
addTopicBtn.addEventListener('click', async () => {
    const topic = topicInput.value;
    const password = passwordInput.value;

    if (topic && password && password.length >= 4 && password.length <= 8) {
        await addDoc(collection(db, "topics"), { 
            name: topic, 
            password: password
        });
        topicInput.value = '';
        passwordInput.value = '';
    }
});

// Render topics list
onSnapshot(collection(db, "topics"), (snapshot) => {
    topicsList.innerHTML = '';
    snapshot.forEach(async (topicDoc) => {
        const topic = topicDoc.data();
        const topicId = topicDoc.id;

        const topicCard = document.createElement('div');
        topicCard.className = 'topic-card';

        const topicContent = document.createElement('div');
        const topicTitle = document.createElement('h2');
        topicTitle.textContent = topic.name;
        topicContent.appendChild(topicTitle);
        
        const meta = document.createElement('div');
        meta.className = 'meta';
        const commentsRef = collection(db, "topics", topicId, "comments");
        onSnapshot(commentsRef, (commentsSnapshot) => {
            meta.textContent = `${commentsSnapshot.size}개 의견 · 클릭하여 의견 작성`;
        });
        topicContent.appendChild(meta);
        
        topicCard.appendChild(topicContent);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '삭제';
        deleteBtn.addEventListener('click', async () => {
            const enteredPassword = prompt('삭제 비밀번호를 입력하세요:');
            if (enteredPassword === topic.password) {
                await deleteDoc(doc(db, "topics", topicId));
            } else {
                alert('비밀번호가 일치하지 않습니다.');
            }
        });
        topicCard.appendChild(deleteBtn);

        topicsList.appendChild(topicCard);
    });
});