// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        const icon = mobileMenuBtn.querySelector('i');
        if (mobileMenu.classList.contains('hidden')) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        } else {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        }
    });
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        const target = document.querySelector(href);
        if (target) {
            // For home, scroll to top immediately
            if (href === '#home') {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            } else {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
            // Close mobile menu if open
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }
    });
});

// Active navigation link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function highlightNavLink() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('text-blue-600', 'font-semibold');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('text-blue-600', 'font-semibold');
                }
            });
        }
    });
}

window.addEventListener('scroll', highlightNavLink);

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all cards and sections
document.querySelectorAll('.ios-card, section > h2').forEach(el => {
    observer.observe(el);
});

// EmailJS Configuration
// ============================================
// To set up EmailJS:
// 1. Go to https://www.emailjs.com/ and create a free account
// 2. Create an Email Service (Gmail, Outlook, etc.)
// 3. Create an Email Template with these variables: {{from_name}}, {{from_email}}, {{message}}
// 4. Get your Service ID, Template ID, and Public Key from the dashboard
// 5. Replace the values below with your credentials
// ============================================
const EMAILJS_CONFIG = {
    serviceID: 'service_dsfingl',      // Replace with your EmailJS Service ID
    templateID: 'template_d0kszd3',     // Replace with your EmailJS Template ID
    publicKey: 'cNuJiI0OHiqIK9-RH'        // Replace with your EmailJS Public Key
};

// Initialize EmailJS when the page loads
function initializeEmailJS() {
    if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG.publicKey && EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY') {
        emailjs.init(EMAILJS_CONFIG.publicKey);
        console.log('EmailJS initialized successfully');
    } else if (typeof emailjs === 'undefined') {
        console.warn('EmailJS SDK not loaded yet, will retry...');
        setTimeout(initializeEmailJS, 100);
    }
}

// Wait for EmailJS to load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEmailJS);
} else {
    // DOM already loaded
    initializeEmailJS();
}

// Also try to initialize when window loads (in case EmailJS loads after DOMContentLoaded)
window.addEventListener('load', initializeEmailJS);

// Contact form handling
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const message = document.getElementById('contact-message').value.trim();
        
        // Simple validation
        if (!name || !email || !message) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending...';
        submitButton.disabled = true;
        
        // Check if EmailJS is configured
        if (EMAILJS_CONFIG.serviceID === 'YOUR_SERVICE_ID' || 
            EMAILJS_CONFIG.templateID === 'YOUR_TEMPLATE_ID' || 
            EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY') {
            // EmailJS not configured - use mailto as fallback
            const mailtoLink = `mailto:aerontumanon7@gmail.com?subject=Contact from ${encodeURIComponent(name)}&body=${encodeURIComponent(`From: ${name} (${email})\n\nMessage:\n${message}`)}`;
            window.location.href = mailtoLink;
            showNotification('Opening your email client...', 'success');
            contactForm.reset();
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            return;
        }
        
        // Ensure EmailJS is initialized
        if (typeof emailjs === 'undefined') {
            showNotification('Email service is loading, please try again in a moment.', 'error');
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            return;
        }
        
        // Initialize EmailJS if not already initialized
        if (!emailjs.init) {
            try {
                emailjs.init(EMAILJS_CONFIG.publicKey);
            } catch (initError) {
                console.error('EmailJS initialization error:', initError);
            }
        }
        
        try {
            // Send email using EmailJS
            const response = await emailjs.send(EMAILJS_CONFIG.serviceID, EMAILJS_CONFIG.templateID, {
                from_name: name,
                from_email: email,
                message: message,
                to_email: 'aerontumanon7@gmail.com',
                reply_to: email
            });
            
            console.log('Email sent successfully:', response);
            showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
            contactForm.reset();
        } catch (error) {
            console.error('EmailJS Error:', error);
            showNotification(`Failed to send message: ${error.text || error.message || 'Unknown error'}. Please try again or contact me directly at aerontumanon7@gmail.com`, 'error');
        } finally {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    });
}

// Notification system
function showNotification(message, type = 'success') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification fixed top-24 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl ${
        type === 'success' 
            ? 'bg-green-500/90 text-white' 
            : 'bg-red-500/90 text-white'
    }`;
    notification.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Parallax effect for hero section (disabled to prevent navigation issues)
// window.addEventListener('scroll', () => {
//     const scrolled = window.pageYOffset;
//     const hero = document.querySelector('#home');
//     if (hero) {
//         hero.style.transform = `translateY(${scrolled * 0.5}px)`;
//         hero.style.opacity = 1 - scrolled / 500;
//     }
// });

// Add ripple effect to buttons
document.querySelectorAll('.ios-button').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .ios-button {
        position: relative;
        overflow: hidden;
    }
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    .notification {
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);

// Changing text animation for technologies
const technologies = ['HTML', 'Tailwind CSS', 'JavaScript'];

let techIndex = 0;
const changingTextEl = document.getElementById('changing-text');


let isTyping = false;
let currentText = '';
let currentTechIndex = 0;
let charIndex = 0;

function typeTechnology() {
    if (!changingTextEl || isTyping) return;
    
    const targetText = technologies[currentTechIndex];
    
    // Typing phase
    if (charIndex < targetText.length) {
        currentText += targetText.charAt(charIndex);
        changingTextEl.textContent = currentText;
        charIndex++;
        setTimeout(typeTechnology, 60); // Typing speed: 60ms per character
    } 
    // Wait before erasing
    else if (charIndex === targetText.length) {
        setTimeout(() => {
            // Erasing phase
            if (currentText.length > 0) {
                currentText = currentText.slice(0, -1);
                changingTextEl.textContent = currentText;
                setTimeout(typeTechnology, 120); // Erasing speed: 30ms per character
            } else {
                // Move to next technology
                currentTechIndex = (currentTechIndex + 1) % technologies.length;
                charIndex = 0;
                setTimeout(typeTechnology, 150); // Pause before typing next
            }
        }, 1000); // Wait 1 second before erasing
    }
}


// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Add fade-in to initial elements
    document.querySelectorAll('.ios-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Initialize typing animation
    if (changingTextEl) {
        changingTextEl.textContent = '';
        changingTextEl.style.transition = 'none';
        typeTechnology(); // Start typing animation
    }
    
    // Resume Modal functionality
    const resumeModal = document.getElementById('resume-modal');
    const viewResumeBtn = document.getElementById('view-resume-btn');
    const closeResumeModal = document.getElementById('close-resume-modal');
    
    if (viewResumeBtn && resumeModal) {
        viewResumeBtn.addEventListener('click', () => {
            resumeModal.classList.remove('hidden');
            resumeModal.classList.add('flex');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (closeResumeModal && resumeModal) {
        closeResumeModal.addEventListener('click', () => {
            resumeModal.classList.add('hidden');
            resumeModal.classList.remove('flex');
            document.body.style.overflow = '';
        });
    }
    
    // Close modal when clicking outside
    if (resumeModal) {
        resumeModal.addEventListener('click', (e) => {
            if (e.target === resumeModal) {
                resumeModal.classList.add('hidden');
                resumeModal.classList.remove('flex');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Resume image click to view full size
    const resumeImages = document.querySelectorAll('#resume-grid img');
    resumeImages.forEach(img => {
        img.addEventListener('click', function() {
            const fullSizeModal = document.createElement('div');
            fullSizeModal.className = 'fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm';
            fullSizeModal.innerHTML = `
                <button class="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-300 hover:text-white transition-colors">
                    <i class="fas fa-times text-xl"></i>
                </button>
                <div class="max-w-5xl w-full mx-4">
                    <img src="${this.src}" alt="${this.alt}" class="w-full h-auto rounded-lg">
                </div>
            `;
            document.body.appendChild(fullSizeModal);
            document.body.style.overflow = 'hidden';
            
            const closeBtn = fullSizeModal.querySelector('button');
            const closeFullSize = () => {
                fullSizeModal.remove();
                document.body.style.overflow = '';
            };
            
            closeBtn.addEventListener('click', closeFullSize);
            fullSizeModal.addEventListener('click', (e) => {
                if (e.target === fullSizeModal) closeFullSize();
            });
        });
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && resumeModal && !resumeModal.classList.contains('hidden')) {
            resumeModal.classList.add('hidden');
            resumeModal.classList.remove('flex');
            document.body.style.overflow = '';
        }
        if (e.key === 'Escape' && certificatesModal && !certificatesModal.classList.contains('hidden')) {
            certificatesModal.classList.add('hidden');
            certificatesModal.classList.remove('flex');
            document.body.style.overflow = '';
        }
        if (e.key === 'Escape' && coverLettersModal && !coverLettersModal.classList.contains('hidden')) {
            coverLettersModal.classList.add('hidden');
            coverLettersModal.classList.remove('flex');
            document.body.style.overflow = '';
        }
    });
    
    // Certificates Modal functionality
    const certificatesModal = document.getElementById('certificates-modal');
    const viewCertificatesBtn = document.getElementById('view-certificates-btn');
    const closeCertificatesModal = document.getElementById('close-certificates-modal');
    
    if (viewCertificatesBtn && certificatesModal) {
        viewCertificatesBtn.addEventListener('click', () => {
            certificatesModal.classList.remove('hidden');
            certificatesModal.classList.add('flex');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (closeCertificatesModal && certificatesModal) {
        closeCertificatesModal.addEventListener('click', () => {
            certificatesModal.classList.add('hidden');
            certificatesModal.classList.remove('flex');
            document.body.style.overflow = '';
        });
    }
    
    // Close certificates modal when clicking outside
    if (certificatesModal) {
        certificatesModal.addEventListener('click', (e) => {
            if (e.target === certificatesModal) {
                certificatesModal.classList.add('hidden');
                certificatesModal.classList.remove('flex');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Certificate image click to view full size
    const certificateImages = document.querySelectorAll('#certificates-grid img');
    certificateImages.forEach(img => {
        img.addEventListener('click', function() {
            const fullSizeModal = document.createElement('div');
            fullSizeModal.className = 'fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm';
            fullSizeModal.innerHTML = `
                <button class="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-300 hover:text-white transition-colors">
                    <i class="fas fa-times text-xl"></i>
                </button>
                <div class="max-w-5xl w-full mx-4">
                    <img src="${this.src}" alt="${this.alt}" class="w-full h-auto rounded-lg">
                </div>
            `;
            document.body.appendChild(fullSizeModal);
            document.body.style.overflow = 'hidden';
            
            const closeBtn = fullSizeModal.querySelector('button');
            const closeFullSize = () => {
                fullSizeModal.remove();
                document.body.style.overflow = '';
            };
            
            closeBtn.addEventListener('click', closeFullSize);
            fullSizeModal.addEventListener('click', (e) => {
                if (e.target === fullSizeModal) closeFullSize();
            });
        });
    });
    
    // Cover Letters Modal functionality
    const coverLettersModal = document.getElementById('cover-letters-modal');
    const viewCoverLettersBtn = document.getElementById('view-cover-letters-btn');
    const closeCoverLettersModal = document.getElementById('close-cover-letters-modal');
    
    if (viewCoverLettersBtn && coverLettersModal) {
        viewCoverLettersBtn.addEventListener('click', () => {
            coverLettersModal.classList.remove('hidden');
            coverLettersModal.classList.add('flex');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (closeCoverLettersModal && coverLettersModal) {
        closeCoverLettersModal.addEventListener('click', () => {
            coverLettersModal.classList.add('hidden');
            coverLettersModal.classList.remove('flex');
            document.body.style.overflow = '';
        });
    }
    
    // Close cover letters modal when clicking outside
    if (coverLettersModal) {
        coverLettersModal.addEventListener('click', (e) => {
            if (e.target === coverLettersModal) {
                coverLettersModal.classList.add('hidden');
                coverLettersModal.classList.remove('flex');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Cover letter image click to view full size
    const coverLetterImages = document.querySelectorAll('#cover-letters-grid img');
    coverLetterImages.forEach(img => {
        img.addEventListener('click', function() {
            const fullSizeModal = document.createElement('div');
            fullSizeModal.className = 'fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm';
            fullSizeModal.innerHTML = `
                <button class="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-300 hover:text-white transition-colors">
                    <i class="fas fa-times text-xl"></i>
                </button>
                <div class="max-w-5xl w-full mx-4">
                    <img src="${this.src}" alt="${this.alt}" class="w-full h-auto rounded-lg">
                </div>
            `;
            document.body.appendChild(fullSizeModal);
            document.body.style.overflow = 'hidden';
            
            const closeBtn = fullSizeModal.querySelector('button');
            const closeFullSize = () => {
                fullSizeModal.remove();
                document.body.style.overflow = '';
            };
            
            closeBtn.addEventListener('click', closeFullSize);
            fullSizeModal.addEventListener('click', (e) => {
                if (e.target === fullSizeModal) closeFullSize();
            });
        });
    });
});

