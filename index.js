// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD1YSEuHuZi58jqxtQdl7HUMdyXM-byiHs",
    authDomain: "uniaovital-2d3cb.firebaseapp.com",
    projectId: "uniaovital-2d3cb",
    storageBucket: "uniaovital-2d3cb.appspot.com",
    messagingSenderId: "433331089546",
    appId: "1:433331089546:web:4239ecc3757eccb5a0fd73"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Auth Modal Elements
const authModal = document.getElementById('authModal');
const closeAuthModal = document.getElementById('closeAuthModal');
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');

// Admin Modal Elements
const adminModal = document.getElementById('adminModal');
const closeAdminModal = document.getElementById('closeAdminModal');
const adminSearch = document.getElementById('adminSearch');
const refreshUsers = document.getElementById('refreshUsers');
const usersTableBody = document.getElementById('usersTableBody');
const userDonationsModal = document.getElementById('userDonationsModal');
const closeDonationsModal = document.getElementById('closeDonationsModal');
const donationsTableBody = document.getElementById('donationsTableBody');
const donationsUserName = document.getElementById('donationsUserName');
const donationsUserEmail = document.getElementById('donationsUserEmail');

// Open auth modal when login button is clicked
document.querySelectorAll('[href="#login"], .cyber-btn-primary').forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (e.target.getAttribute('href') === '#login' || e.target.textContent.includes('Login')) {
            e.preventDefault();
            authModal.classList.remove('hidden');
            showLoginForm();
        }
    });
});

// Tab switching
loginTab.addEventListener('click', showLoginForm);
registerTab.addEventListener('click', showRegisterForm);

function showLoginForm() {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    loginTab.classList.add('text-cybercyan', 'border-b-2', 'border-cybercyan');
    loginTab.classList.remove('text-gray-400');
    registerTab.classList.add('text-gray-400');
    registerTab.classList.remove('text-cybercyan', 'border-b-2', 'border-cybercyan');
}

function showRegisterForm() {
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    registerTab.classList.add('text-cybercyan', 'border-b-2', 'border-cybercyan');
    registerTab.classList.remove('text-gray-400');
    loginTab.classList.add('text-gray-400');
    loginTab.classList.remove('text-cybercyan', 'border-b-2', 'border-cybercyan');
}

// Close modals
closeAuthModal.addEventListener('click', () => authModal.classList.add('hidden'));
closeAdminModal.addEventListener('click', () => adminModal.classList.add('hidden'));
closeDonationsModal.addEventListener('click', () => userDonationsModal.classList.add('hidden'));

// Login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Check if admin user
        if (email === 'admin@imperium.com') {
            document.addEventListener('keydown', adminShortcut);
        }
        
        authModal.classList.add('hidden');
        showNotification('Login realizado com sucesso!', 'success');
        
        // Update UI for logged in user
        updateUIForUser(user);
        
    } catch (error) {
        loginError.textContent = error.message;
        loginError.classList.remove('hidden');
    }
});

// Register form submission
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const cpfCnpj = document.getElementById('registerCpfCnpj').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        registerError.textContent = 'As senhas não coincidem';
        registerError.classList.remove('hidden');
        return;
    }
    
    // Validate CPF/CNPJ
    if (!validateCpfCnpj(cpfCnpj)) {
        registerError.textContent = 'CPF/CNPJ inválido';
        registerError.classList.remove('hidden');
        return;
    }
    
    try {
        // Check if CPF/CNPJ already exists
        const cpfCnpjSnapshot = await db.collection('users').where('cpfCnpj', '==', cpfCnpj).get();
        if (!cpfCnpjSnapshot.empty) {
            registerError.textContent = 'CPF/CNPJ já cadastrado';
            registerError.classList.remove('hidden');
            return;
        }
        
        // Check if email already exists
        const emailSnapshot = await db.collection('users').where('email', '==', email).get();
        if (!emailSnapshot.empty) {
            registerError.textContent = 'Email já cadastrado';
            registerError.classList.remove('hidden');
            return;
        }
        
        // Create user in Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Create user in Firestore
        await db.collection('users').doc(user.uid).set({
            name: name,
            email: email,
            cpfCnpj: cpfCnpj,
            score: 0,
            nivel: 1,
            dataCadastro: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        authModal.classList.add('hidden');
        showNotification('Cadastro realizado com sucesso!', 'success');
        
        // Update UI for logged in user
        updateUIForUser(user);
        
    } catch (error) {
        registerError.textContent = error.message;
        registerError.classList.remove('hidden');
    }
});

// CPF/CNPJ validation
function validateCpfCnpj(cpfCnpj) {
    // Remove non-numeric characters
    const cleaned = cpfCnpj.replace(/\D/g, '');
    
    // Check if it's CPF (11 digits) or CNPJ (14 digits)
    if (cleaned.length === 11) {
        return validateCPF(cleaned);
    } else if (cleaned.length === 14) {
        return validateCNPJ(cleaned);
    }
    return false;
}

function validateCPF(cpf) {
    // CPF validation logic
    // (implementation of CPF validation algorithm)
    // This is a simplified version - you should implement the complete algorithm
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    return true;
}

function validateCNPJ(cnpj) {
    // CNPJ validation logic
    // (implementation of CNPJ validation algorithm)
    // This is a simplified version - you should implement the complete algorithm
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
    return true;
}

// Admin shortcut (press 'ttt' to open admin panel)
let adminKeySequence = [];
function adminShortcut(e) {
    adminKeySequence.push(e.key);
    if (adminKeySequence.length > 3) {
        adminKeySequence.shift();
    }
    
    if (adminKeySequence.join('') === 'ttt') {
        adminModal.classList.remove('hidden');
        loadUsers();
        adminKeySequence = [];
    }
}

// Load users for admin panel
async function loadUsers(searchTerm = '') {
    let query = db.collection('users');
    
    if (searchTerm) {
        query = query.where('email', '>=', searchTerm).where('email', '<=', searchTerm + '\uf8ff');
    }
    
    const snapshot = await query.get();
    usersTableBody.innerHTML = '';
    
    if (snapshot.empty) {
        usersTableBody.innerHTML = '<tr><td colspan="6" class="py-4 text-center text-gray-400">Nenhum usuário encontrado</td></tr>';
        return;
    }
    
    snapshot.forEach(doc => {
        const user = doc.data();
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-700 hover:bg-gray-900';
        row.innerHTML = `
            <td class="py-3 px-4">${user.name}</td>
            <td class="py-3 px-4">${user.email}</td>
            <td class="py-3 px-4">${user.cpfCnpj}</td>
            <td class="py-3 px-4">${user.score}</td>
            <td class="py-3 px-4">${user.nivel}</td>
            <td class="py-3 px-4">
                <button class="view-donations cyber-btn cyber-btn-secondary px-3 py-1 rounded-md text-sm" data-uid="${doc.id}">
                    <i class="fas fa-list mr-1"></i> Doações
                </button>
            </td>
        `;
        usersTableBody.appendChild(row);
    });
    
    // Add event listeners to view donations buttons
    document.querySelectorAll('.view-donations').forEach(btn => {
        btn.addEventListener('click', () => {
            const userId = btn.getAttribute('data-uid');
            loadUserDonations(userId);
        });
    });
}

// Load user donations
async function loadUserDonations(userId) {
    const userDoc = await db.collection('users').doc(userId).get();
    const user = userDoc.data();
    
    donationsUserName.textContent = user.name;
    donationsUserEmail.textContent = user.email;
    
    const snapshot = await db.collection('donations')
        .where('userId', '==', userId)
        .orderBy('dataRegistro', 'desc')
        .get();
    
    donationsTableBody.innerHTML = '';
    
    if (snapshot.empty) {
        donationsTableBody.innerHTML = '<tr><td colspan="7" class="py-4 text-center text-gray-400">Nenhuma doação encontrada</td></tr>';
    } else {
        snapshot.forEach(doc => {
            const donation = doc.data();
            const row = document.createElement('tr');
            row.className = 'border-b border-gray-700 hover:bg-gray-900';
            
            const statusClass = donation.status === 'approved' ? 'text-cybercyan' : 
                              donation.status === 'rejected' ? 'text-cyberred' : 'text-yellow-400';
            
            row.innerHTML = `
                <td class="py-3 px-4">${donation.itemName}</td>
                <td class="py-3 px-4">${donation.itemType}</td>
                <td class="py-3 px-4">${donation.quantity}</td>
                <td class="py-3 px-4">${donation.points || '--'}</td>
                <td class="py-3 px-4 ${statusClass}">${getStatusText(donation.status)}</td>
                <td class="py-3 px-4">${formatDate(donation.dataRegistro)}</td>
                <td class="py-3 px-4">
                    ${donation.status === 'pending' ? `
                    <button class="approve-donation cyber-btn cyber-btn-primary px-2 py-1 rounded-md text-sm mr-1" data-id="${doc.id}">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="reject-donation cyber-btn cyber-btn-secondary px-2 py-1 rounded-md text-sm" data-id="${doc.id}">
                        <i class="fas fa-times"></i>
                    </button>
                    ` : ''}
                </td>
            `;
            donationsTableBody.appendChild(row);
        });
    }
    
    // Add event listeners to approve/reject buttons
    document.querySelectorAll('.approve-donation').forEach(btn => {
        btn.addEventListener('click', async () => {
            const donationId = btn.getAttribute('data-id');
            await approveDonation(donationId, userId);
        });
    });
    
    document.querySelectorAll('.reject-donation').forEach(btn => {
        btn.addEventListener('click', async () => {
            const donationId = btn.getAttribute('data-id');
            await rejectDonation(donationId);
        });
    });
    
    userDonationsModal.classList.remove('hidden');
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Pendente',
        'approved': 'Aprovado',
        'rejected': 'Rejeitado'
    };
    return statusMap[status] || status;
}

function formatDate(timestamp) {
    if (!timestamp) return '--';
    const date = timestamp.toDate();
    return date.toLocaleDateString('pt-BR');
}

// Approve donation
async function approveDonation(donationId, userId) {
    const donationRef = db.collection('donations').doc(donationId);
    const donationDoc = await donationRef.get();
    const donation = donationDoc.data();
    
    // Calculate points (you can adjust this logic)
    const points = donation.quantity * 100; // Example: 100 points per item
    
    // Update donation
    await donationRef.update({
        status: 'approved',
        points: points,
        dataAprovacao: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Update user score and level
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const user = userDoc.data();
    
    const newScore = user.score + points;
    const newLevel = calculateLevel(newScore);
    
    await userRef.update({
        score: newScore,
        nivel: newLevel
    });
    
    // Reload donations
    loadUserDonations(userId);
    showNotification('Doação aprovada e pontos adicionados!', 'success');
}

// Reject donation
async function rejectDonation(donationId) {
    await db.collection('donations').doc(donationId).update({
        status: 'rejected',
        dataAprovacao: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Reload donations (we need to get userId from somewhere)
    // In a real app, you might want to pass userId to this function
    showNotification('Doação rejeitada!', 'warning');
}

// Calculate user level based on score
function calculateLevel(score) {
    if (score <= 1000) return 1;
    if (score <= 10000) return 2;
    if (score <= 100000) return 3;
    if (score <= 1000000) return 4;
    return 5; // And so on...
}

// Admin search functionality
adminSearch.addEventListener('input', (e) => {
    loadUsers(e.target.value);
});

// Refresh users list
refreshUsers.addEventListener('click', () => {
    loadUsers(adminSearch.value);
});

// Update UI when user is logged in
function updateUIForUser(user) {
    // Update navigation to show user menu
    // You can implement this based on your needs
    console.log('User logged in:', user.email);
}

// Notification function
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 cyber-card px-6 py-4 rounded-md shadow-lg ${
        type === 'success' ? 'border-l-4 border-cybercyan' : 'border-l-4 border-cyberred'
    }`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${
                type === 'success' ? 'fa-check-circle text-cybercyan' : 'fa-exclamation-circle text-cyberred'
            } text-2xl mr-3"></i>
            <div>
                <p class="font-bold">${message}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('opacity-0', 'transition-all', 'duration-300');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Check auth state
auth.onAuthStateChanged(user => {
    if (user) {
        updateUIForUser(user);
        
        // If admin user, enable admin shortcut
        if (user.email === 'admin@imperium.com') {
            document.addEventListener('keydown', adminShortcut);
        }
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // You can add any initialization code here
});