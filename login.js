
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Firebase 구성
const firebaseConfig = {
  apiKey: "AIzaSyAzRwYWMjuEw4Jgw_7GO3oe_R_iSAMf-mY",
  authDomain: "chatting-3-dd673.firebaseapp.com",
  projectId: "chatting-3-dd673",
  storageBucket: "chatting-3-dd673.appspot.com",
  messagingSenderId: "744583620806",
  appId: "1:744583620806:web:56b003eddd20a373fb8fc7"
};

// Firebase 앱 및 인증 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('email-input');
    const passwordInput = document.getElementById('password-input');
    const loginSubmitBtn = document.getElementById('login-submit-btn');

    // 로그인 버튼 클릭 이벤트
    loginSubmitBtn.addEventListener('click', async () => {
        const email = emailInput.value;
        const password = passwordInput.value;

        if (!email || !password) {
            alert('이메일과 비밀번호를 모두 입력해주세요.');
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // 로그인 성공
            const user = userCredential.user;
            alert(`로그인 성공! ${user.email}님 환영합니다.`);
            window.location.href = 'index.html'; // 메인 페이지로 이동
        } catch (error) {
            // 로그인 실패
            const errorCode = error.code;
            let errorMessage = '로그인에 실패했습니다. 다시 시도해주세요.';

            // 사용자를 찾을 수 없거나, 비밀번호가 틀렸을 때
            if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
                errorMessage = '가입되지 않은 계정이거나 비밀번호가 올바르지 않습니다. 먼저 회원가입을 진행해주세요.';
            } else if (errorCode === 'auth/invalid-email') {
                errorMessage = '올바른 이메일 형식이 아닙니다.';
            }

            alert(errorMessage);
            console.error("로그인 에러: ", error);
        }
    });
});
