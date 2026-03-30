// Local authentication for admin login
// Username and password should be stored securely, but for this demo they're hardcoded

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password123'; // Change this to your desired password
const MAX_ATTEMPTS = 3;
const LOCKOUT_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

interface LoginAttempt {
  attempts: number;
  lockedUntil: number | null;
}

const getLoginAttempts = (): LoginAttempt => {
  const stored = localStorage.getItem('admin_login_attempts');
  if (!stored) {
    return { attempts: 0, lockedUntil: null };
  }
  return JSON.parse(stored);
};

const setLoginAttempts = (data: LoginAttempt) => {
  localStorage.setItem('admin_login_attempts', JSON.stringify(data));
};

const isAccountLocked = (): boolean => {
  const attempts = getLoginAttempts();
  if (!attempts.lockedUntil) return false;

  if (new Date().getTime() > attempts.lockedUntil) {
    // Lockout period has expired
    setLoginAttempts({ attempts: 0, lockedUntil: null });
    return false;
  }

  return true;
};

const getRemainingLockoutTime = (): number => {
  const attempts = getLoginAttempts();
  if (!attempts.lockedUntil) return 0;

  const remaining = attempts.lockedUntil - new Date().getTime();
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
};

export const login = (username: string, password: string): { success: boolean; message: string } => {
  // Check if account is locked
  if (isAccountLocked()) {
    const remainingTime = getRemainingLockoutTime();
    return {
      success: false,
      message: `Account locked. Try again in ${remainingTime} seconds.`
    };
  }

  // Verify credentials
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Clear login attempts on successful login
    setLoginAttempts({ attempts: 0, lockedUntil: null });

    // Store auth token
    localStorage.setItem('admin_auth_token', 'authenticated');

    return {
      success: true,
      message: 'Login successful'
    };
  }

  // Increment failed attempts
  const attempts = getLoginAttempts();
  const newAttempts = attempts.attempts + 1;

  if (newAttempts >= MAX_ATTEMPTS) {
    // Lock account
    const lockedUntil = new Date().getTime() + LOCKOUT_TIME;
    setLoginAttempts({ attempts: newAttempts, lockedUntil });

    return {
      success: false,
      message: 'Too many failed attempts. Account locked for 30 minutes.'
    };
  }

  // Update attempts count
  setLoginAttempts({ attempts: newAttempts, lockedUntil: null });
  const attemptsRemaining = MAX_ATTEMPTS - newAttempts;

  return {
    success: false,
    message: `Invalid username or password. ${attemptsRemaining} attempt${attemptsRemaining > 1 ? 's' : ''} remaining.`
  };
};

export const logout = () => {
  localStorage.removeItem('admin_auth_token');
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem('admin_auth_token') === 'authenticated';
};

export const getAttemptsRemaining = (): number => {
  const attempts = getLoginAttempts();
  return Math.max(0, MAX_ATTEMPTS - attempts.attempts);
};
