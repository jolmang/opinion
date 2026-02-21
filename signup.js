
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

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
    const signupSubmitBtn = document.getElementById('signup-submit-btn');

    // 회원가입 버튼 클릭 이벤트
    signupSubmitBtn.addEventListener('click', async () => {
        const email = emailInput.value;
        const password = passwordInput.value;

        if (!email || !password) {
            alert('이메일과 비밀번호를 모두 입력해주세요.');
            return;
        }

        // *** 비밀번호 길이 클라이언트 측에서 미리 확인 ***
        if (password.length < 6) {
            alert('비밀번호는 6자리 이상이어야 합니다.');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // 회원가입 성공
            const user = userCredential.user;
            alert(`회원가입 성공! ${user.email}님, 로그인 페이지로 이동합니다.`);
            window.location.href = 'login.html'; // 로그인 페이지로 이동
        } catch (error) {
            // 회원가입 실패
            const errorCode = error.code;
            let errorMessage = error.message;

            if (errorCode === 'auth/email-already-in-use') {
                errorMessage = '이미 사용 중인 이메일 주소입니다.';
            } else if (errorCode === 'auth/weak-password') {
                errorMessage = '비밀번호는 6자리 이상이어야 합니다.';
            } else if (errorCode === 'auth/invalid-email') {
                errorMessage = '올바른 이메일 형식이 아닙니다.';
            }

            alert(`회원가입 실패: ${errorMessage}`);
            console.error("회원가입 에러: ", error);
        }
    });
});
