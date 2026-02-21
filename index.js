
// Import the shared DB and Auth instances from main.js
import { db, auth } from './main.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy, doc, deleteDoc } from 'firebase/firestore';

const authContainer = document.getElementById('auth-container');
const topicCreationContainer = document.getElementById('topic-creation-container');
const topicsList = document.getElementById('topics-list');

// 1. Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        renderLoggedInUI(user);
    } else {
        renderLoggedOutUI();
    }
    fetchTopics();
});

// 2. Render UI for logged-in users
function renderLoggedInUI(user) {
    authContainer.innerHTML = `<button id="logout-btn">로그아웃</button>`;
    document.getElementById('logout-btn').addEventListener('click', async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("로그아웃 에러: ", error);
        }
    });

    topicCreationContainer.innerHTML = `
        <input type="text" id="topic-title" placeholder="새로운 주제를 입력하세요" maxlength="50">
        <button id="add-topic-btn">주제 추가</button>
    `;
    document.getElementById('add-topic-btn').addEventListener('click', () => addTopic(user.uid));
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
            fetchTopics();
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
            fetchTopics();
        } catch (error) {
            console.error("주제 삭제 에러: ", error);
            alert("주제 삭제에 실패했습니다.");
        }
    }
}

// 6. Fetch and display all topics
async function fetchTopics() {
    topicsList.innerHTML = '';
    const currentUser = auth.currentUser;

    try {
        const q = query(collection(db, "topics"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
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
                        event.stopPropagation(); // <-- This is the fix!
                        deleteTopic(topicId);
                    });
                    topicItemContainer.appendChild(deleteBtn);
                }

                topicsList.appendChild(topicItemContainer);
            });
        }
    } catch (error) {
        console.error("주제 목록 불러오기 에러: ", error);
        topicsList.innerHTML = '<p style="text-align:center; color:red;">주제를 불러오는 데 실패했습니다.</p>';
    }
}

// --- Initialize the page ---
fetchTopics();
