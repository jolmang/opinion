
// Import the shared Auth instance from main.js
import { auth } from './main.js';
import { signInWithEmailAndPassword } from "firebase/auth";

const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("로그인 성공! 메인 페이지로 이동합니다.");
        window.location.href = 'index.html'; // Redirect to the main page
    } catch (error) {
        console.error("로그인 에러", error.code, error.message);
        let errorMessage = "로그인에 실패했습니다. 이메일과 비밀번호를 다시 확인해주세요.";
        // More specific error messages can be added here based on error.code
        if (error.code === 'auth/user-not-found') {
            errorMessage = "등록되지 않은 이메일입니다.";
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = "비밀번호가 틀렸습니다.";
        }
        alert(errorMessage);
    }
});
