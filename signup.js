
// Import the shared Auth instance from main.js
import { auth } from './main.js';
import { createUserWithEmailAndPassword } from "firebase/auth";

const signupForm = document.getElementById('signup-form');

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (password.length < 6) {
        alert("비밀번호는 6자리 이상이어야 합니다.");
        return;
    }

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("회원가입 성공! 로그인 페이지로 이동합니다.");
        window.location.href = 'login.html'; // Redirect to the login page
    } catch (error) {
        console.error("회원가입 에러", error.code, error.message);
        let errorMessage = "회원가입에 실패했습니다. 다시 시도해주세요.";
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = "이미 사용 중인 이메일입니다.";
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = "유효하지 않은 이메일 형식입니다.";
        }
        alert(errorMessage);
    }
});
