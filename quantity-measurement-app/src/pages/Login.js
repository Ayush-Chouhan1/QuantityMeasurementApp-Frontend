import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import { loginApi, registerApi } from '../api';
import '../styles/auth.css';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{6,}$/;

function Login() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [toastShow, setToastShow] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [loginEmailErr, setLoginEmailErr] = useState(false);
  const [loginPwErr, setLoginPwErr] = useState(false);
  const [showLoginPw, setShowLoginPw] = useState(false);

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPw, setSignupPw] = useState('');
  const [signupMobile, setSignupMobile] = useState('');
  const [signupNameErr, setSignupNameErr] = useState(false);
  const [signupEmailErr, setSignupEmailErr] = useState(false);
  const [signupPwErr, setSignupPwErr] = useState(false);
  const [signupMobileErr, setSignupMobileErr] = useState(false);
  const [showSignupPw, setShowSignupPw] = useState(false);

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showToast(message, type) {
    setToastMsg(message);
    setToastType(type);
    setToastShow(true);
    setTimeout(function () {
      setToastShow(false);
    }, 3000);
  }

  async function doLogin() {
    let valid = true;

    if (!isValidEmail(loginEmail)) {
      setLoginEmailErr(true);
      valid = false;
    } else {
      setLoginEmailErr(false);
    }

    if (!PASSWORD_REGEX.test(loginPw)) {
      setLoginPwErr(true);
      valid = false;
    } else {
      setLoginPwErr(false);
    }

    if (!valid) {
      return;
    }

    try {
      const data = await loginApi(loginEmail, loginPw);
      const token = typeof data.token === 'string' ? data.token.trim() : '';
      if (!token || token === 'undefined' || token.split('.').length !== 3) {
        throw new Error('Invalid token received from server. Please try logging in again.');
      }

      localStorage.setItem('qm_token', token);
      localStorage.setItem('qm_user', loginEmail);
      showToast('Login successful! Redirecting to dashboard...', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message || 'Invalid email or password!', 'error');
    }
  }

  async function doSignup() {
    let valid = true;

    if (!signupName) {
      setSignupNameErr(true);
      valid = false;
    } else {
      setSignupNameErr(false);
    }

    if (!isValidEmail(signupEmail)) {
      setSignupEmailErr(true);
      valid = false;
    } else {
      setSignupEmailErr(false);
    }

    if (!PASSWORD_REGEX.test(signupPw)) {
      setSignupPwErr(true);
      valid = false;
    } else {
      setSignupPwErr(false);
    }

    if (!/^[6-9]\d{9}$/.test(signupMobile)) {
      setSignupMobileErr(true);
      valid = false;
    } else {
      setSignupMobileErr(false);
    }

    if (!valid) {
      return;
    }

    try {
      await registerApi(signupName, signupEmail, signupPw, signupMobile);
      showToast('Registration successful! Redirecting to login...', 'success');
      setTimeout(function () {
        setActiveTab('login');
      }, 3000);
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="card">
        <div className="brand">
          <svg className="brand-icon" viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="28" y="0" width="24" height="12" rx="4" fill="#5dade2" />
            <rect x="30" y="12" width="20" height="14" rx="2" fill="#85c1e9" />
            <rect x="14" y="24" width="52" height="58" rx="10" fill="#aed6f1" />
            <rect x="14" y="50" width="52" height="32" rx="0" fill="#5dade2" clipPath="url(#bottleClip)" />
            <line x1="20" y1="54" x2="30" y2="54" stroke="#2980b9" strokeWidth="2" />
            <line x1="20" y1="62" x2="34" y2="62" stroke="#2980b9" strokeWidth="2" />
            <line x1="20" y1="70" x2="30" y2="70" stroke="#2980b9" strokeWidth="2" />
            <clipPath id="bottleClip">
              <rect x="14" y="24" width="52" height="58" rx="10" />
            </clipPath>
            <rect x="8" y="82" width="64" height="14" rx="4" fill="#e59866" />
            <line x1="14" y1="82" x2="14" y2="96" stroke="#d35400" strokeWidth="1" />
            <line x1="22" y1="82" x2="22" y2="96" stroke="#d35400" strokeWidth="1" />
            <line x1="30" y1="82" x2="30" y2="96" stroke="#d35400" strokeWidth="1" />
            <line x1="38" y1="82" x2="38" y2="96" stroke="#d35400" strokeWidth="1" />
            <line x1="46" y1="82" x2="46" y2="96" stroke="#d35400" strokeWidth="1" />
            <line x1="54" y1="82" x2="54" y2="96" stroke="#d35400" strokeWidth="1" />
            <line x1="62" y1="82" x2="62" y2="96" stroke="#d35400" strokeWidth="1" />
          </svg>
          <p className="brand-title">Quantity<br />Measurement</p>
        </div>

        <div className="form-section">
          <div className="tabs">
            <div className={activeTab === 'login' ? 'tab active' : 'tab'} onClick={() => setActiveTab('login')}>Login</div>
            <div className={activeTab === 'signup' ? 'tab active' : 'tab'} onClick={() => setActiveTab('signup')}>Signup</div>
          </div>

          {activeTab === 'login' && (
            <div className="form-panel active">
              <div className="field">
                <label>Email Id</label>
                <input type="email" placeholder="Enter your email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className={loginEmailErr ? 'error' : ''} />
                {loginEmailErr && <p className="error-msg show">Enter a valid email address.</p>}
              </div>

              <div className="field">
                <label>Password</label>
                <div className="password-wrap">
                  <input type={showLoginPw ? 'text' : 'password'} placeholder="Enter your password" value={loginPw} onChange={(e) => setLoginPw(e.target.value)} className={loginPwErr ? 'error' : ''} />
                  <span className="toggle-pw" onClick={() => setShowLoginPw(!showLoginPw)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </span>
                </div>
                {loginPwErr && <p className="error-msg show">Password must contain uppercase, lowercase, special character (@#$%^&+=!) and be at least 6 characters.</p>}
              </div>

              <button className="btn-submit" onClick={doLogin}>Login</button>
              <p className="switch-link">Don&apos;t have an account? <button type="button" className="link-button" onClick={() => setActiveTab('signup')}>Sign Up</button></p>
            </div>
          )}

          {activeTab === 'signup' && (
            <div className="form-panel active">
              <div className="field">
                <label>Full Name</label>
                <input type="text" placeholder="Enter your full name" value={signupName} onChange={(e) => setSignupName(e.target.value)} className={signupNameErr ? 'error' : ''} />
                {signupNameErr && <p className="error-msg show">Full name is required.</p>}
              </div>

              <div className="field">
                <label>Email Id</label>
                <input type="email" placeholder="Enter your email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} className={signupEmailErr ? 'error' : ''} />
                {signupEmailErr && <p className="error-msg show">Enter a valid email address.</p>}
              </div>

              <div className="field">
                <label>Password</label>
                <div className="password-wrap">
                  <input type={showSignupPw ? 'text' : 'password'} placeholder="Create a password" value={signupPw} onChange={(e) => setSignupPw(e.target.value)} className={signupPwErr ? 'error' : ''} />
                  <span className="toggle-pw" onClick={() => setShowSignupPw(!showSignupPw)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </span>
                </div>
                {signupPwErr && <p className="error-msg show">Password must contain uppercase, lowercase, special character (@#$%^&+=!) and be at least 6 characters.</p>}
              </div>

              <div className="field">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  placeholder="Enter mobile number"
                  maxLength={10}
                  value={signupMobile}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setSignupMobile(val);
                  }}
                  className={signupMobileErr ? 'error' : ''}
                />
                {signupMobileErr && <p className="error-msg show">Enter a valid 10-digit mobile number starting with 6-9.</p>}
              </div>

              <button className="btn-submit" onClick={doSignup}>Signup</button>
              <p className="switch-link">Already have an account? <button type="button" className="link-button" onClick={() => setActiveTab('login')}>Login</button></p>
            </div>
          )}
        </div>
      </div>

      <Toast message={toastMsg} show={toastShow} type={toastType} />
    </div>
  );
}

export default Login;
