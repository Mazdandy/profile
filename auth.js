const STORAGE_KEY = 'mockAuthUsers';

const defaultUsers = [
  {
    name: 'Demo QA User',
    role: 'QA Engineer',
    email: 'demo@qa-portal.dev',
    password: 'Demo123!'
  }
];

function getUsers() {
  const storedUsers = localStorage.getItem(STORAGE_KEY);

  if (!storedUsers) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUsers));
    return [...defaultUsers];
  }

  try {
    const parsedUsers = JSON.parse(storedUsers);
    return Array.isArray(parsedUsers) && parsedUsers.length ? parsedUsers : [...defaultUsers];
  } catch (error) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUsers));
    return [...defaultUsers];
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function setStatus(element, message, type) {
  element.textContent = message;
  element.className = 'status-message';

  if (type) {
    element.classList.add(type === 'success' ? 'is-success' : 'is-error');
  }
}

function handleLogin(form) {
  const status = form.querySelector('[data-status]');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;
    const users = getUsers();

    if (!email || !password) {
      setStatus(status, 'Please enter both email and password.', 'error');
      return;
    }

    const user = users.find((item) => item.email === email && item.password === password);

    if (!user) {
      setStatus(status, 'Invalid mock credentials. Try the demo account or register a new user.', 'error');
      return;
    }

    setStatus(status, `Login successful. Welcome back, ${user.name}. Redirecting...`, 'success');

    window.setTimeout(() => {
      window.location.href = 'index.html';
    }, 1200);
  });
}

function handleRegister(form) {
  const status = form.querySelector('[data-status]');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = form.name.value.trim();
    const role = form.role.value.trim();
    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;
    const users = getUsers();

    if (!name || !role || !email || !password || !confirmPassword) {
      setStatus(status, 'Please complete all fields before continuing.', 'error');
      return;
    }

    if (password.length < 6) {
      setStatus(status, 'Password must be at least 6 characters long.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      setStatus(status, 'Password confirmation does not match.', 'error');
      return;
    }

    const existingUser = users.find((item) => item.email === email);

    if (existingUser) {
      setStatus(status, 'This email is already registered in the mock store.', 'error');
      return;
    }

    users.push({
      name,
      role,
      email,
      password
    });

    saveUsers(users);
    setStatus(status, 'Registration successful. Redirecting to login...', 'success');
    form.reset();

    window.setTimeout(() => {
      window.location.href = 'login.html';
    }, 1200);
  });
}

const authForm = document.querySelector('[data-auth]');

if (authForm) {
  const mode = authForm.getAttribute('data-auth');

  if (mode === 'login') {
    handleLogin(authForm);
  }

  if (mode === 'register') {
    handleRegister(authForm);
  }
}
