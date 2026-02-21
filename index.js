
// Import the shared DB and Auth instances from main.js
import { db, auth } from './main.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
// Import onSnapshot for real-time updates
import { collection, addDoc, serverTimestamp, query, orderBy, doc, deleteDoc, onSnapshot } from 'firebase/firestore';

const authContainer = document.getElementById('auth-container');
const topicCreationContainer = document.getElementById('topic-creation-container');
const topicsList = document.getElementById('topics-list');

// To keep track of the real-time listener and prevent duplicates
let unsubscribeTopics = null;

// --- Event Delegation for Topic Creation ---
// A single, persistent listener on the container handles the "Add Topic" button clicks.
// This prevents attaching multiple listeners, which causes duplicate topic creation.

// We will setup one listener on the parent container to handle clicks on the add button
topicCreationContainer.addEventListener('click', (event) => {
    if (event.target.id === 'add-topic-btn') {
        const user = auth.currentUser;
        if (user) {
            addTopic(user.uid);
        }
    }
});

// 1. Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        renderLoggedInUI();
    } else {
        renderLoggedOutUI();
    }
    listenForTopics();
});

// 2. Render UI for logged-in users (without adding listeners)
function renderLoggedInUI() {
    authContainer.innerHTML = `<button id="logout-btn">로그아웃</button>`;
    document.getElementById('logout-btn').addEventListener('click', async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("로그아웃 에러: ", error);
        }
    });

    // This only renders the HTML. The click listener is now handled by the parent container.
    topicCreationContainer.innerHTML = `
        <input type="text" id="topic-title" placeholder="새로운 주제를 입력하세요" maxlength="50">
        <button id="add-topic-btn">주제 추가</button>
    `;
}

// 3. Render UI for logged-out users
function renderLoggedOutUI() {
    authContainer.innerHTML = `<a href="login.html" class="btn-login">로그인</a>`;
    topicCreationContainer.innerHTML = `
        <div class="login-prompt">
            <p>주제를 작성하려면 로그인이 필요합니다.</p>
            <a href="login.html">로그인 페이지로 이동</a>
        </div>
    `;
}

// 4. Add a new topic to Firestore
async function addTopic(userId) {
    const titleInput = document.getElementById('topic-title');
    const title = titleInput.value.trim();

    if (title) {
        try {
            await addDoc(collection(db, 'topics'), {
                title: title,
                authorId: userId,
                createdAt: serverTimestamp()
            });
            titleInput.value = '';
        } catch (error) {
            console.error("주제 추가 에러: ", error);
            alert("주제 추가에 실패했습니다. 잠시 후 다시 시도해주세요.");
        }
    }
}

// 5. Delete a topic from Firestore
async function deleteTopic(topicId) {
    if (confirm('정말로 이 주제를 삭제하시겠습니까?')) {
        try {
            await deleteDoc(doc(db, 'topics', topicId));
        } catch (error) {
            console.error("주제 삭제 에러: ", error);
            alert("주제 삭제에 실패했습니다.");
        }
    }
}

// 6. Listen for real-time topic updates
function listenForTopics() {
    if (unsubscribeTopics) {
        unsubscribeTopics();
    }

    const q = query(collection(db, "topics"), orderBy("createdAt", "desc"));

    unsubscribeTopics = onSnapshot(q, (querySnapshot) => {
        const currentUser = auth.currentUser;
        topicsList.innerHTML = '';

        if (querySnapshot.empty) {
            topicsList.innerHTML = '<p style="text-align:center; color:#888;">아직 등록된 주제가 없습니다.</p>';
        } else {
            querySnapshot.forEach((doc) => {
                const topic = doc.data();
                const topicId = doc.id;

                const topicItemContainer = document.createElement('div');
                topicItemContainer.className = 'topic-item-container';

                const titleElement = document.createElement('span');
                titleElement.className = 'topic-title';
                titleElement.textContent = topic.title;
                titleElement.addEventListener('click', () => {
                    window.location.href = `comments.html?topicId=${topicId}`;
                });
                topicItemContainer.appendChild(titleElement);

                if (currentUser && currentUser.uid === topic.authorId) {
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'delete-btn';
                    deleteBtn.textContent = '삭제';
                    deleteBtn.addEventListener('click', (event) => {
                        event.stopPropagation();
                        deleteTopic(topicId);
                    });
                    topicItemContainer.appendChild(deleteBtn);
                }
                topicsList.appendChild(topicItemContainer);
            });
        }
    }, (error) => {
        console.error("주제 목록 불러오기 에러: ", error);
        topicsList.innerHTML = '<p style="text-align:center; color:red;">주제를 불러오는 데 실패했습니다.</p>';
    });
}
