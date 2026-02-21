
// Import the shared DB instance from main.js
import { db } from './main.js'; 
// deleteDoc is no longer needed, so it has been removed from the import.
import { collection, addDoc, onSnapshot, doc, getDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';

const topicTitle = document.getElementById('topic-title');
const commentsList = document.getElementById('comments-list');
const commentForm = document.getElementById('comment-form');
const backBtn = document.getElementById('back-btn');

const urlParams = new URLSearchParams(window.location.search);
const topicId = urlParams.get('topicId');

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

// 3. Add a new comment to Firestore (anonymous)
async function addComment(inputElement) {
    const commentText = inputElement.value.trim();
    if (commentText && topicId) {
        const commentsRef = collection(db, "topics", topicId, "comments");
        try {
            await addDoc(commentsRef, {
                text: commentText,
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
            // The delete button logic has been completely removed.
            li.innerHTML = `<span>${comment.text}</span>`;
            commentsList.appendChild(li);
        });
    });
}

// 5. Setup the back button
backBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// --- Initialize the page ---
fetchTopicTitle();
renderCommentForm();
fetchComments();
