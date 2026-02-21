
// Import the shared DB and Auth instances from main.js
import { db, auth } from './main.js'; 
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, onSnapshot, doc, getDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';

const topicTitle = document.getElementById('topic-title');
const commentsList = document.getElementById('comments-list');
const commentForm = document.getElementById('comment-form');
const backBtn = document.getElementById('back-btn');

const urlParams = new URLSearchParams(window.location.search);
const topicId = urlParams.get('topicId');
let currentUser = null; // To hold the current user's state

// 1. Fetch and display the topic title
async function fetchTopicTitle() {
    if (!topicId) {
        topicTitle.textContent = "주제 ID가 없습니다.";
        return;
    }
    const topicRef = doc(db, "topics", topicId);
    try {
        const docSnap = await getDoc(topicRef);
        if (docSnap.exists()) {
            topicTitle.textContent = docSnap.data().title;
        } else {
            topicTitle.textContent = "주제를 찾을 수 없습니다.";
        }
    } catch (error) {
        console.error("주제 제목 불러오기 에러:", error);
        topicTitle.textContent = "주제를 불러오는 중 오류 발생";
    }
}

// 2. Render the comment form UI
function renderCommentForm() {
    commentForm.innerHTML = `
        <input type="text" id="comment-input" placeholder="의견을 입력하세요">
        <button id="add-comment-btn">의견 추가</button>
    `;
    document.getElementById('add-comment-btn').addEventListener('click', () => {
        const commentInput = document.getElementById('comment-input');
        addComment(commentInput);
    });
}

// 3. Add a new comment to Firestore
async function addComment(inputElement) {
    const commentText = inputElement.value.trim();
    if (commentText && topicId) {
        const commentsRef = collection(db, "topics", topicId, "comments");
        try {
            await addDoc(commentsRef, {
                text: commentText,
                authorId: currentUser ? currentUser.uid : null, // Save UID if logged in
                createdAt: serverTimestamp()
            });
            inputElement.value = '';
        } catch (error) {
            console.error("댓글 추가 에러: ", error);
            alert("댓글 추가에 실패했습니다. Firestore 보안 규칙을 확인해주세요.");
        }
    }
}

// 4. Fetch and display comments in real-time
function fetchComments() {
    if (!topicId) return;
    const commentsRef = collection(db, "topics", topicId, "comments");
    const q = query(commentsRef, orderBy("createdAt", "asc"));

    onSnapshot(q, (snapshot) => {
        commentsList.innerHTML = '';
        if (snapshot.empty) {
            commentsList.innerHTML = '<li class="no-comments">등록된 댓글이 없습니다.</li>';
            return;
        }
        snapshot.forEach(doc => {
            const comment = doc.data();
            const li = document.createElement('li');
            li.innerHTML = `<span>${comment.text}</span>`;

            // Show delete button only if the comment was posted by the current user
            if (currentUser && currentUser.uid === comment.authorId) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-comment-btn';
                deleteBtn.textContent = 'x';
                deleteBtn.onclick = async () => {
                    if (confirm("정말로 댓글을 삭제하시겠습니까?")) {
                        await deleteDoc(doc.ref).catch(e => alert("삭제 실패"));
                    }
                };
                li.appendChild(deleteBtn);
            }
            commentsList.appendChild(li);
        });
    });
}

// 5. Listen for authentication state changes
onAuthStateChanged(auth, user => {
    currentUser = user;
    fetchComments(); // Re-fetch comments to show/hide delete buttons
});

// 6. Setup the back button
backBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// --- Initialize the page ---
fetchTopicTitle();
renderCommentForm();
fetchComments();
