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

document.getElementById('loanApplicationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const termsCheckbox = document.querySelector('input[name="terms"]');
    if (!termsCheckbox.checked) {
        alert('Please agree to the Terms and Conditions');
        return;
    }

    // Show success message
    alert('Application submitted successfully! We will contact you within 24 hours.');
    
    // Reset form
    this.reset();
    currentStep = 1;
    document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
    document.querySelectorAll('.progress-step').forEach(step => {
        step.classList.remove('active', 'completed');
    });
    document.querySelector('.form-step[data-step="1"]').classList.add('active');
    document.querySelector('.progress-step[data-step="1"]').classList.add('active');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
