let currentStep = 1;
const totalSteps = 4;

function nextStep() {
    const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    const inputs = currentStepElement.querySelectorAll('input[required], select[required], textarea[required]');
    
    let isValid = true;
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = 'red';
        } else {
            input.style.borderColor = '';
        }
    });

    if (!isValid) {
        alert('Please fill in all required fields');
        return;
    }

    if (currentStep < totalSteps) {
        document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.remove('active');
        document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.add('completed');
        
        currentStep++;
        
        document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.add('active');
        document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.add('active');

        if (currentStep === 4) {
            populateReview();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function prevStep() {
    if (currentStep > 1) {
        document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.remove('active');
        document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.remove('active');
        
        currentStep--;
        
        document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.add('active');
        document.querySelector(`.progress-step[data-step="${currentStep + 1}"]`).classList.remove('completed');

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function populateReview() {
    const form = document.getElementById('loanApplicationForm');
    const formData = new FormData(form);
    
    let reviewHTML = '<div style="background: #f5f5f5; padding: 30px; border-radius: 8px;">';
    
    reviewHTML += '<h4 style="margin-bottom: 20px; color: #FFC107;">Personal Information</h4>';
    reviewHTML += `<p><strong>Name:</strong> ${formData.get('firstName')} ${formData.get('lastName')}</p>`;
    reviewHTML += `<p><strong>Email:</strong> ${formData.get('email')}</p>`;
    reviewHTML += `<p><strong>Phone:</strong> ${formData.get('phone')}</p>`;
    reviewHTML += `<p><strong>Date of Birth:</strong> ${formData.get('dob')}</p>`;
    reviewHTML += `<p><strong>Address:</strong> ${formData.get('address')}</p>`;
    reviewHTML += `<p><strong>State:</strong> ${formData.get('state')}</p>`;
    
    reviewHTML += '<h4 style="margin-top: 30px; margin-bottom: 20px; color: #FFC107;">Loan Details</h4>';
    reviewHTML += `<p><strong>Loan Type:</strong> ${formData.get('loanType')}</p>`;
    reviewHTML += `<p><strong>Loan Amount:</strong> ₦${parseInt(formData.get('loanAmount')).toLocaleString()}</p>`;
    reviewHTML += `<p><strong>Duration:</strong> ${formData.get('loanDuration')} Months</p>`;
    reviewHTML += `<p><strong>Purpose:</strong> ${formData.get('loanPurpose')}</p>`;
    reviewHTML += `<p><strong>Employment Status:</strong> ${formData.get('employmentStatus')}</p>`;
    reviewHTML += `<p><strong>Monthly Income:</strong> ₦${parseInt(formData.get('monthlyIncome')).toLocaleString()}</p>`;
    
    reviewHTML += '<h4 style="margin-top: 30px; margin-bottom: 20px; color: #FFC107;">Documents</h4>';
    reviewHTML += `<p><strong>ID Document:</strong> ${formData.get('idDocument').name || 'Not uploaded'}</p>`;
    reviewHTML += `<p><strong>Bank Statement:</strong> ${formData.get('bankStatement').name || 'Not uploaded'}</p>`;
    reviewHTML += `<p><strong>Proof of Address:</strong> ${formData.get('proofOfAddress').name || 'Not uploaded'}</p>`;
    
    reviewHTML += '</div>';
    
    document.getElementById('reviewContent').innerHTML = reviewHTML;
}

// Form submission with Supabase integration
document.getElementById('loanApplicationForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const termsCheckbox = document.querySelector('input[name="terms"]');
    if (!termsCheckbox.checked) {
        alert('Please agree to the Terms and Conditions');
        return;
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

    try {
        // Check if user is logged in
        const user = await auth.getUser();
        
        if (!user) {
            // Save form data to localStorage and redirect to login
            const formData = new FormData(this);
            const formObject = {};
            formData.forEach((value, key) => {
                if (value instanceof File) {
                    formObject[key] = value.name;
                } else {
                    formObject[key] = value;
                }
            });
            localStorage.setItem('pendingLoanApplication', JSON.stringify(formObject));
            
            alert('Please login or register to submit your application');
            window.location.href = 'login.html?redirect=apply-loan.html';
            return;
        }

        const formData = new FormData(this);
        
        // Upload documents to Supabase Storage
        const idDoc = formData.get('idDocument');
        const bankStatement = formData.get('bankStatement');
        const proofAddress = formData.get('proofOfAddress');
        const employmentProof = formData.get('employmentProof');
        
        let idDocUrl = '', bankStatementUrl = '', proofAddressUrl = '', employmentProofUrl = '';
        
        // Upload ID document
        if (idDoc && idDoc.size > 0) {
            const idPath = `${user.id}/id_${Date.now()}_${idDoc.name}`;
            const { data, error } = await db.uploadDocument(idDoc, idPath);
            if (error) throw error;
            idDocUrl = idPath;
        }
        
        // Upload bank statement
        if (bankStatement && bankStatement.size > 0) {
            const bankPath = `${user.id}/bank_${Date.now()}_${bankStatement.name}`;
            const { data, error } = await db.uploadDocument(bankStatement, bankPath);
            if (error) throw error;
            bankStatementUrl = bankPath;
        }
        
        // Upload proof of address
        if (proofAddress && proofAddress.size > 0) {
            const proofPath = `${user.id}/proof_${Date.now()}_${proofAddress.name}`;
            const { data, error } = await db.uploadDocument(proofAddress, proofPath);
            if (error) throw error;
            proofAddressUrl = proofPath;
        }
        
        // Upload employment proof (optional)
        if (employmentProof && employmentProof.size > 0) {
            const empPath = `${user.id}/employment_${Date.now()}_${employmentProof.name}`;
            const { data, error } = await db.uploadDocument(employmentProof, empPath);
            if (error) throw error;
            employmentProofUrl = empPath;
        }

        // Update user profile if needed
        const profileData = {
            first_name: formData.get('firstName'),
            last_name: formData.get('lastName'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            state: formData.get('state'),
            bvn: formData.get('bvn'),
            date_of_birth: formData.get('dob')
        };
        
        await db.updateProfile(user.id, profileData);

        // Create loan application
        const applicationData = {
            user_id: user.id,
            loan_type: formData.get('loanType'),
            loan_amount: parseFloat(formData.get('loanAmount')),
            loan_duration: parseInt(formData.get('loanDuration')),
            loan_purpose: formData.get('loanPurpose'),
            employment_status: formData.get('employmentStatus'),
            monthly_income: parseFloat(formData.get('monthlyIncome')),
            id_document_url: idDocUrl,
            bank_statement_url: bankStatementUrl,
            proof_of_address_url: proofAddressUrl,
            employment_proof_url: employmentProofUrl,
            status: 'pending'
        };

        const { data, error } = await db.createLoanApplication(applicationData);

        if (error) throw error;

        // Clear any pending application data
        localStorage.removeItem('pendingLoanApplication');

        // Show success message
        alert('Application submitted successfully! We will review your application and contact you within 24 hours.');
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';

    } catch (error) {
        console.error('Error submitting application:', error);
        alert('Error submitting application: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Submit Application';
    }
});

// File input validation
document.querySelectorAll('input[type="file"]').forEach(input => {
    input.addEventListener('change', function() {
        const maxSize = this.accept.includes('pdf') && this.name === 'bankStatement' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
        
        if (this.files[0] && this.files[0].size > maxSize) {
            alert(`File size exceeds the maximum allowed (${maxSize / (1024 * 1024)}MB)`);
            this.value = '';
        }
    });
});

// Check for pending application on page load
window.addEventListener('DOMContentLoaded', async () => {
    const user = await auth.getUser();
    
    if (user) {
        // Check if there's a pending application
        const pendingApp = localStorage.getItem('pendingLoanApplication');
        if (pendingApp) {
            const shouldRestore = confirm('You have a pending application. Would you like to restore it?');
            if (shouldRestore) {
                const appData = JSON.parse(pendingApp);
                const form = document.getElementById('loanApplicationForm');
                
                // Restore form data (except files)
                Object.keys(appData).forEach(key => {
                    const input = form.querySelector(`[name="${key}"]`);
                    if (input && !(input instanceof HTMLInputElement && input.type === 'file')) {
                        input.value = appData[key];
                    }
                });
            }
            localStorage.removeItem('pendingLoanApplication');
        }
    }
});
