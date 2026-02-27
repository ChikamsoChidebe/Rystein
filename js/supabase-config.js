// Supabase Configuration
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Replace with your Supabase URL
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your Supabase anon key

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth Helper Functions
const auth = {
    async signUp(email, password, userData) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: userData
            }
        });
        return { data, error };
    },

    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        return { data, error };
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        return { error };
    },

    async resetPassword(email) {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email);
        return { data, error };
    },

    async getUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    async updateUser(updates) {
        const { data, error } = await supabase.auth.updateUser(updates);
        return { data, error };
    }
};

// Database Helper Functions
const db = {
    async createProfile(userId, profileData) {
        const { data, error } = await supabase
            .from('profiles')
            .insert([{ user_id: userId, ...profileData }]);
        return { data, error };
    },

    async getProfile(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();
        return { data, error };
    },

    async updateProfile(userId, updates) {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('user_id', userId);
        return { data, error };
    },

    async createLoanApplication(applicationData) {
        const { data, error } = await supabase
            .from('loan_applications')
            .insert([applicationData]);
        return { data, error };
    },

    async getLoanApplications(userId) {
        const { data, error } = await supabase
            .from('loan_applications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        return { data, error };
    },

    async getAllLoanApplications() {
        const { data, error } = await supabase
            .from('loan_applications')
            .select('*, profiles(*)')
            .order('created_at', { ascending: false });
        return { data, error };
    },

    async updateLoanStatus(applicationId, status, adminNotes = '') {
        const { data, error } = await supabase
            .from('loan_applications')
            .update({ 
                status, 
                admin_notes: adminNotes,
                updated_at: new Date().toISOString()
            })
            .eq('id', applicationId);
        return { data, error };
    },

    async uploadDocument(file, path) {
        const { data, error } = await supabase.storage
            .from('documents')
            .upload(path, file);
        return { data, error };
    },

    async getDocumentUrl(path) {
        const { data } = supabase.storage
            .from('documents')
            .getPublicUrl(path);
        return data.publicUrl;
    }
};

// Check if user is authenticated
async function checkAuth() {
    const user = await auth.getUser();
    return user !== null;
}

// Redirect if not authenticated
async function requireAuth() {
    const isAuth = await checkAuth();
    if (!isAuth) {
        window.location.href = 'login.html';
    }
    return isAuth;
}

// Redirect if authenticated
async function requireGuest() {
    const isAuth = await checkAuth();
    if (isAuth) {
        window.location.href = 'dashboard.html';
    }
}

// Check if user is admin
async function isAdmin() {
    const user = await auth.getUser();
    if (!user) return false;
    
    const { data } = await db.getProfile(user.id);
    return data?.role === 'admin';
}
