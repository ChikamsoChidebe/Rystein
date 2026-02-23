// Mobile Menu Toggle
const mobileToggle = document.getElementById('mobileToggle');
const navMenu = document.getElementById('navMenu');

if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Loan Calculator
const loanAmount = document.getElementById('loanAmount');
const loanAmountRange = document.getElementById('loanAmountRange');
const loanDuration = document.getElementById('loanDuration');
const loanDurationRange = document.getElementById('loanDurationRange');
const interestRate = document.getElementById('interestRate');
const monthlyPayment = document.getElementById('monthlyPayment');
const totalAmount = document.getElementById('totalAmount');
const totalInterest = document.getElementById('totalInterest');

function calculateLoan() {
    const principal = parseFloat(loanAmount.value);
    const months = parseFloat(loanDuration.value);
    const rate = parseFloat(interestRate.value) / 100;

    const interest = principal * rate;
    const total = principal + interest;
    const monthly = total / months;

    if (monthlyPayment) {
        monthlyPayment.textContent = `₦${monthly.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
        totalAmount.textContent = `₦${total.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
        totalInterest.textContent = `₦${interest.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
    }
}

if (loanAmount) {
    loanAmount.addEventListener('input', (e) => {
        loanAmountRange.value = e.target.value;
        calculateLoan();
    });

    loanAmountRange.addEventListener('input', (e) => {
        loanAmount.value = e.target.value;
        calculateLoan();
    });

    loanDuration.addEventListener('input', (e) => {
        loanDurationRange.value = e.target.value;
        calculateLoan();
    });

    loanDurationRange.addEventListener('input', (e) => {
        loanDuration.value = e.target.value;
        calculateLoan();
    });

    interestRate.addEventListener('input', calculateLoan);

    calculateLoan();
}

// Scroll to Top Button
const scrollTop = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollTop.classList.add('show');
    } else {
        scrollTop.classList.remove('show');
    }
});

if (scrollTop) {
    scrollTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Form Validation
const forms = document.querySelectorAll('form');
forms.forEach(form => {
    form.addEventListener('submit', (e) => {
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
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
            e.preventDefault();
            alert('Please fill in all required fields');
        }
    });
});

// Cookie Consent
function showCookieConsent() {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
        const banner = document.createElement('div');
        banner.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #000;
            color: #fff;
            padding: 20px;
            text-align: center;
            z-index: 9999;
        `;
        banner.innerHTML = `
            <p style="margin-bottom: 15px;">We use cookies to improve your experience. By continuing, you agree to our use of cookies.</p>
            <button onclick="acceptCookies()" style="background: #FFC107; color: #000; border: none; padding: 10px 30px; border-radius: 5px; cursor: pointer; font-weight: 600;">Accept</button>
        `;
        document.body.appendChild(banner);
    }
}

function acceptCookies() {
    localStorage.setItem('cookieConsent', 'true');
    document.querySelector('[style*="position: fixed"]').remove();
}

window.acceptCookies = acceptCookies;
setTimeout(showCookieConsent, 1000);

// Animation on Scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.service-card, .testimonial-card, .feature-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
});
