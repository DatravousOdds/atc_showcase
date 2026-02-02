// =======================================
// CONFIGURATION & CONSTANTS


// =======================================
const CONFIG = {
    SCROLL_THRESHOLD: 200,
    ANIMATION_STAGGER_DELAY: 300,
    TOAST_DURATION: 4000,
    OBSERVER_THRESHOLD: 0.1,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_FILE_TYPES: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
};

// =======================================
// DOM ELEMENTS CACHE
// =======================================
const DOM = {
    // Navigation
    navbar: this.document.querySelector('header'),
    mobileMenuIcon: document.querySelector('.mobile-menu i'),
    iconContainer: document.querySelector('.mobile-menu'),
    mobileMenu: document.querySelector('.mobile-lg-menu'),

    // Forms
    quoteForm: document.getElementById('quoteForm'),
    quoteSubmitBtn: document.getElementById('quoteSubmitBtn'),
    form: document.getElementById('quoteinfo'),

    // Toast notifications
    successToast: document.getElementById('successToast'),
    successToastMessage: successToast.querySelector('.toast-content'),

    // Career/Application elements
    careerPositions:document.querySelectorAll('.career-position'),
    careerGeneralApplication:document.querySelector('.career-general-app'),
    modalOverlay:document.querySelector('.modal-overlay'),
    modalCloseBtn:document.querySelector('.close-btn'),
    applicationTitle:document.querySelector('.application-position .position-title'),
    applicationMeta:document.querySelector('.application-position .position-meta'),
    applicationCancelBtn:document.querySelector('.application-actions .cancel'),
    applicationSubmitBtn:document.querySelector('.application-actions .submit'),

    // Resume upload
    resumeInput:document.getElementById('resume'),
    resumeButton:document.querySelector('.input-border'),

    // Form inputs
    getFormInputs: () => ({
        firstName:document.getElementById('firstName'),
        lastName:document.getElementById('lastName'),
        email:document.getElementById('email'),
        phone:document.getElementById('phoneNumber'),
        linkedInUrl:document.getElementById('linkedInProfile'),
        coverLetter:document.getElementById('coverLetter'),
    })
};

// =======================================
// UTILITY FUNCTIONS
// =======================================
const Utils = {
    showToast(title, message, duration = CONFIG.TOAST_DURATION) {
        DOM.successToastMessage.innerHTML = `
            <div class="toast-header">
                <p>${title}</p>
            </div>
            <div class="toast-message">
                <p>${message}</p>
            </div>
        `;
        DOM.successToast.classList.add('show');

        setTimeout(() => {
            DOM.successToast.classList.remove('show');
        }, duration)
    },

    resetApplicationForm() {
        const inputs = DOM.getFormInputs();
        Object.values(inputs).forEach(input => {
            if (input) {
                input.value = '';
            }
        })

        DOM.resumeInput.value = '';
        this.resetResumeButton();
    },

    resetResumeButton() {
        DOM.resumeButton.innerHTML = `
            <i class="fa-solid fa-upload"></i>
            <p>Click to upload your resume</p>
            <p>PDF, DOC, or DOCX (Max)
        
        `;
    },

    toggleModal(show) {
        if (!DOM.modalOverlay) return;

        if (show) {
            DOM.modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            DOM.modalOverlay.classList.remove('active');
            document.body.style.overflow = '';
            this.resetApplicationForm();
        }
    },

    validateFile(file) {
        if (!file) return { valid: false, error: 'No file selected' };

        // Check file size
        if (file.size > CONFIG.MAX_FILE_SIZE) {
            return {
                valid: false,
                error: 'File size exceeds 5MB limit. Please choose a smaller file.'
            }
        }

        // Check file type
        if (!CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
            return { valid: false, error: 'Invalid file type. Please upload a PDF, DOC, or DOCX file.' };
        }

        return { valid: true };
    },

    setButtonLoading(button, isLoading, loadingText = 'Submitting...', defaultText = 'Submit') {
        if (!button) return;

        button.disabled = isLoading;
        button.textContent = isLoading ? loadingText : defaultText;
    }
};

// =======================================
// SCROLL FUNCTIONALITY
// =======================================
const ScrollManager = {
    init() {    
        // Prevent scroll restoration on page load
        if (history.scrollRestoration) {
            history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);

        window.addEventListener('scroll', this.handleScroll.bind(this));

    },

    handleScroll() {
        if (!DOM.navbar) return;

        if(window.scrollY > CONFIG.SCROLL_THRESHOLD) {
            DOM.navbar.classList.add('scrolled');
        } else {
            DOM.navbar.classList.remove('scrolled');
        }
    }


};

// =======================================
// ANIMATION ON SCROLL
// =======================================
const AnimationObserver = {
    observer: null,

    init() {
        this.observer = new IntersectionObserver(
            this.handleIntersection.bind(this),
            { threshold: CONFIG.OBSERVER_THRESHOLD }
        );

        document.querySelectorAll('.reveal').forEach(el => {
            this.observer.observe(el);
        })
    },

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.animateSection(entry.target)
            }
        })
    },

    animateSection(section) {
        const data = section.dataset;

        Object.keys(data).forEach(key => {
            if (key.startsWith('animateTarget')) {
                    const suffix = key.replace('animateTarget', '');
                    const className = `animateClass${suffix}`;
                    const selector = data[key];
                    const animateName = data[className];

                    if (selector && animateName) {
                        this.applyAnimation(section, selector, animateName)
                    }
                }
        })
    },

    applyAnimation(section, selector, animateName) {
        const items = section.querySelectorAll(selector);
        const animateClass = animateName.replace('.','');

        items.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add(animateClass);
            }, index * CONFIG.ANIMATION_STAGGER_DELAY) // stagger animation by 200ms
        });
    }
};

// =======================================
// MOBILE MENU
// =======================================
const MobileMenu = {
    init() {
        if (!DOM.iconContainer) return;

        DOM.iconContainer.addEventListener('click', this.toggle.bind(this));
    },

    toogle() {
        const icon = DOM.iconContainer.querySelector('i');
        if (!icon || !DOM.mobileMenu) return;

        const isActive = DOM.mobileMenu.classList.toggle('active');
        icon.className = isActive ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
    }
};

// =======================================
// RESUME UPLOAD
// =======================================
const ResumeUpload = {
    init() {
        if (!DOM.resumeButton || !DOM.resumeInput) return;

        DOM.resumeButton.addEventListener('click', () => {
            DOM.resumeInput.click();
        });

        DOM.resumeInput.addEventListener('change', this.handleFileChange.bind(this));
    },

    handleFileChange(event) {
        const file = event.target.files[0];
        console.log("📁 File selected:", file);

        if (!file) {
            Utils.resetResumeButton();
            return;
        }

        const vaildation = Utils.validateFile(file);

        if (!vaildation.valid) {
            alert(vaildation.error);
            DOM.resumeInput.value = '';
            Utils.resetResumeButton();
            return;
        }

        this.showFileSelected(file);
        console.log("✅ File is valid:", file.name, file.size, "bytes");
    },

    showFileSelected(file) {
        DOM.resumeButton.innerHTML = `
            <i class="fa-solid fa-check-circle" style="color: #10b981"</i>
            <p style="color: #10b981">${file.name} selected</p>
            <p style="color: #666; font-size: 0.8rem;">(Click to change)</p>
        `;
    }

};

// =======================================
// CAREER APPLICATIONS
// =======================================
const CareerApplications = {
    init() {
        this.bindEvents();
    },

    bindEvents() {
        // Close modal buttons
        DOM.modalCloseBtn?.addEventListener('click', () => Utils.toggleModal(false));
        DOM.applicationCancelBtn?.addEventListener('click', () => Utils.toggleModal(false));

        // Submit application
        DOM.applicationSubmitBtn?.addEventListener('click', this.submitApplication.bind(this));

        // General application
        DOM.careerGeneralApplication?.addEventListener('click', () => {
            this.openApplicationModal('General Application', {
                location: 'Multiple Locations',
                type: 'Various',
                position: 'Open Position'
            });
        });

        // Specific positions
        DOM.careerPositions.forEach(position => {
            position.addEventListener('click', () => {
                const data = this.extractPositionData(position);
                this.openApplicationModal(data.title, data)
            });
        });
    },

    extractPositionData(position) {
        return {
            title: position.querySelector('.career-info h4')?.textContent || '',
            location: position.querySelector('.info .city')?.textContent || '',
            type: position.querySelector('.info .position-type')?.textContent || '',
        };
    },

    openApplicationModal(title, data) {
        DOM.applicationTitle.textContent = title;

        const metaHTML = data.position ? `
            <span>
                <i class="fa-solid fa-location-dot"></i>
                <p id="location">${data.location}</p>
            </span>
            <span>
                <i class="fa-solid fa-briefcase"></i>
                <p id="type">${data.type}</p>
            </span>
            <span>
                <i class="fa-solid fa-building"></i>
                <p id="position">${data.position}</p>
            </span>
        
        `: `
            <span>
                <i class="fa-solid fa-location-dot"></i>
                <p id="location">${data.location}</p>
            </span>
            <span>
                <i class="fa-solid fa-briefcase"></i>
                <p id="type">${data.type}</p>
            </span>        
           `;

        DOM.applicationMeta.innerHTML = metaHTML;
        Utils.toggleModal(true);
    },

    async submitApplication() {
        const inputs = DOM.getFormInputs();
        const formData = this.collectFormData(inputs);

        // Validation
        if (!this.vaildateRequiredFields(formData)) {
            alert('Please fill in all required fields');
            return;
        }

        Utils.setButtonLoading(DOM.applicationSubmitBtn, true, 'Submitting...', 'Submit Application');

        try {
            const response = await fetch('/api/applications', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.handleSubmitSuccess(result);
            } else {
                this.handleSubmitError(result);
            }
        } catch (error) {
            console.error('Error submitting application:', error);
            alert('An error occurred while submitting your application. Please try again later.');
        } finally {
            Utils.setButtonLoading(DOM.applicationSubmitBtn, false, 'Submitting...', 'Submit Application')
        }

    },

    collectFormData(inputs) {
        const formData = new FormData();

        formData.append('firstName', inputs.firstName.value);
        formData.append('lastName', inputs.lastName.value);
        formData.append('email', inputs.email.value);
        formData.append('phone', inputs.phone.value);
        formData.append('linkedInProfile', inputs.linkedInUrl.value);
        formData.append('coverLetter', inputs.coverLetter.value);
        formData.append('position', DOM.applicationTitle.textContent);
        formData.append('location', document.getElementById('location')?.textContent.trim() || '');
        formData.append('type', document.getElementById('type')?.textContent.trim() || '');

        const resumeFile = DOM.resumeInput.files[0];
        if (resumeFile) {
            formData.append('resume', resumeFile);
            console.log("Resume file attached:", resumeFile.name, resumeFile.size, "bytes");
        }

        return formData;
    },
    
    vaildateRequiredFields(formData) {
        const required = ['firstName', 'lastName', 'email', 'phone'];
        return required.every(field => formData.get(field));
    },

    handleSubmitSuccess(result) {
        console.log("Application submitted:", result);

        Utils.showToast(
            'Application Submitted!',
            'Thank you for applying. We will review your application and get back to you soon.'
        );

        Utils.resetApplicationForm();
        Utils.toggleModal(false);
    },

    handleSubmitError(result) {
        console.error("❌ Submission failed:", result);
        alert("Error:" + (result.message || "Failed to submit application."));
    }
};

// =======================================
// QUOTE FORM
// =======================================
const QuoteForm = {
    init() {
        if (!DOM.form) return;

        DOM.form.addEventListener('submit', this.handleSubmit.bind(this));
    },

    async handleSubmit(e) {
        e.preventDefault();

        const formData = new FormData(DOM.form);
        const formObject = Object.fromEntries(formData.entries());

        Utils.setButtonLoading(DOM.quoteSubmitBtn, true, 'Submitting...', 'SEND MESSAGE');

        try {
            const response = await fetch('/api/quote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formObject)
            });

            const data = await response.json();
            console.log("Quote response:", data);

            if (data.quoteId) {
                this.handleSuccess();
            } else {
                throw new Error('Failed to submit quote request');
            }
        } catch (error) {
            console.error("Error submitting quote request");
            alert("An error occurred while submitting your quote request. Please try again later.");
        } finally {
            Utils.setButtonLoading(DOM.quoteSubmitBtn, false, 'Submitting...', 'SEND MESSAGE');
        }
    },

    handleSuccess() {
        Utils.showToast(
            'Message Sent!',
            "We'll get back to you within 24 hrs."
        );
        DOM.form.reset();
    }
}

// =======================================
// INITIALIZE APPLICATION
// =======================================
function init() {
    console.log("🚀 Initializing application...");

    ScrollManager.init();
    AnimationObserver.init();
    ResumeUpload.init();
    CareerApplications.init();
    QuoteForm.init();

    console.log('✅ Application initialized successfully');
}

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}







// const section = document.querySelector('#services');






// window.addEventListener('scroll', function() {
    

//     if (this.window.scrollY > 200) {
//         navbar.classList.add('scrolled')
//     } else {
//         navbar.classList.remove('scrolled')
//     }
// });

// // ========== ANIMATION ON SCROLL ==========
// const observer = new IntersectionObserver((entries) => {
//     entries.forEach(entry => {
        
//         if (entry.isIntersecting) {
//             const section = entry.target;
//             const data = section.dataset;
            
//             Object.keys(data).forEach(key => {
//                 console.log("Key:", key);
//                 if (key.startsWith('animateTarget')) {

//                     const suffix = key.replace('animateTarget', '');
//                     const className = `animateClass${suffix}`;
        
//                     const selector = data[key];
//                     const animateName = data[className];

//                     console.log('target', selector)
//                     console.log('animateName', animateName)

//                     if (selector && animateName) {
//                         const items = section.querySelectorAll(selector);
//                         const animateClass = animateName.replace('.','');
//                         // loop through and add animate class
//                         items.forEach((item, index) => {
//                             console.log("item:", item);
//                             setTimeout(() => {
//                                 item.classList.add(animateClass);
//                             }, index * 300) // stagger animation by 200ms
//                         });
//                     }
//                 }
                
                
//             })

            
//         } else {
//             console.log("Sectin is out of view");
            
//         }
//     });
// }, {
//     threshold: 0.1
// });

// document.querySelectorAll('.reveal').forEach(el => {
//     observer.observe(el);
// })

// // ========== RESUME UPLOAD HANDLING ==========
// resumeButton.addEventListener('click', () => {
//     resumeInput.click();
// });

// resumeInput.addEventListener('change', (event) => {
//     const file = event.target.files[0];

//     console.log("📁 File selected:", file);

//     if  (file) {
//         // check file size (max 5MB)
//         if (file.size > 5 * 1024 * 1024) {
//             alert('File size exceeds 5MB limit. Please choose a smaller file.');
//             resumeInput.value = ''; // reset input
//             return;
//         } else {
//             // check file type
//             const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
//             if (!allowedTypes.includes(file.type)) {
//                 alert('Invalid file type. Please upload a PDF, DOC, or DOCX file.');
//                 resumeInput.value = ''; // reset input
//                 return;
//             }
//         }

//         resumeButton.innerHTML = `
//             <i class="fa-solid fa-check-circle" style="color: #10b981"></i>
//             <p style="color: #10b981"> ${file.name} selected</p>
//             <p style="color: #666; font-size: 0.8rem;">(Click to change)</p>
//         `;

//         console.log("✅ File is valid:", file.name, file.size, "bytes");
//     } else {
//         resumeButton.innerHTML = `
//             <i class="fa-solid fa-upload"></i>
//             <p>Click to upload your resume</p>
//             <p>PDF, DOC, or DOCX (Max 5MB)</p>
//         `;
//         console.log("No file selected");
//     }
// });


// // =========== MODAL ACTIONS ===================
// modalCloseBtn.addEventListener('click', () => {
//     if(modalOverlay) {
//         modalOverlay.classList.remove('active');
//         document.body.style.overflow = 'scroll'; 
//         // Reset form
//         document.getElementById('firstName').value = '';
//         document.getElementById('lastName').value = '';
//         document.getElementById('email').value = '';
//         document.getElementById('phoneNumber').value = '';
//         document.getElementById('linkedInProfile').value = '';
//         document.getElementById('coverLetter').value = '';
//     }

    

   
   
// });

// iconContainer.addEventListener('click', () => {
//     const icon = iconContainer.querySelector('i');

//     if(mobileMenu.classList.contains('active')) {

//         mobileMenu.classList.remove('active');
//         icon.className = 'fa-solid fa-bars';
//     } else {
        
//         mobileMenu.classList.add('active');
//         icon.className = 'fa-solid fa-xmark';
//     }
    
// });


// // =========== APPLICATIONS ====================
// applicationCancelBtn.addEventListener('click', () => {
//     if (modalOverlay) {
//         modalOverlay.classList.remove('active');
//         document.body.style.overflow = 'scroll';
//     }
   
// });

// applicationSubmitBtn.addEventListener('click', async () => {
    
//     const firstName = document.getElementById('firstName').value;
//     const lastName = document.getElementById('lastName').value;
//     const email = document.getElementById('email').value;
//     const phone = document.getElementById('phoneNumber').value;
//     const linkedInUrl = document.getElementById('linkedInProfile').value;
//     const coverLetter = document.getElementById('coverLetter').value;
//     const positionTitle = applicationTitle.textContent;
//     const positionLocation = document.getElementById('location').textContent.trim();
//     const positionType = document.getElementById('type').textContent.trim();
    
//     const resumeFile = resumeInput.files[0]; // Get the selected file
    

//     console.log("Submitting application for:", 
//         "\nposition title: ", positionTitle,
//         "\nlocation: ", positionLocation,
//         "\nposition type: ", positionType,
//         "\nfirstName: ", firstName,
//         "\nlastName: ", lastName,
//         "\nemail: ", email,
//         "\nphone: ", phone,
//         "\nlinkedInUrl: ", linkedInUrl,
//         "\nresumeFile: ", resumeFile,  // ← This will now show the actual file object or undefined
//         "\ncoverLetter: ", coverLetter
//     );

//     // Validation
//     if (!firstName || !lastName || !email || !phone) {
//         alert('Please fill in all required fields');
//         return;
//     }

//     // Create FormData
//     const formData = new FormData();
//     formData.append('firstName', firstName);
//     formData.append('lastName', lastName);
//     formData.append('email', email);
//     formData.append('phone', phone);
//     formData.append('linkedInProfile', linkedInUrl);
//     formData.append('coverLetter', coverLetter);
//     formData.append('position', positionTitle);
//     formData.append('location', positionLocation);
//     formData.append('type', positionType);
    
//     // Only append file if one was selected
//     if (resumeFile) {
//         formData.append('resume', resumeFile);
//         console.log("Resume file attached:", resumeFile.name, resumeFile.size, "bytes");
//     } else {
//         console.log("No resume file selected (optional)");
//     }

//     // Disable button
//     applicationSubmitBtn.disabled = true;
//     applicationSubmitBtn.textContent = 'Submitting...';

//     try {
//         const response = await fetch('/api/applications', {
//             method: 'POST',
//             body: formData
//         });

//         const result = await response.json();

//         if (response.ok && result.success) {
//             console.log("Application submitted:", result);

//             // Show success 
//             successToastMessage.innerHTML = `
//                 <div class="toast-header">
//                     <p>Application Submitted!</p>
//                 </div>
//                 <div class="toast-message">
//                     <p>Thank you for applying. We will review your application and get back to you soon.</p>
//                 </div>
//             `;
//             successToast.classList.add('show');

//             setTimeout(() => {
//                 successToast.classList.remove('show');
//             }, 4000);

//             // Reset form
//             document.getElementById('firstName').value = '';
//             document.getElementById('lastName').value = '';
//             document.getElementById('email').value = '';
//             document.getElementById('phoneNumber').value = '';
//             document.getElementById('linkedInProfile').value = '';
//             document.getElementById('coverLetter').value = '';
//             resumeInput.value = '';
//             resumeButton.innerHTML = `
//                 <i class="fa-solid fa-upload"></i>
//                 <p>Click to upload your resume</p>
//                 <p>PDF, DOC, or DOCX (Max 5MB)</p>
//             `;

//             // Close modal
//             if (modalOverlay) {
//                 modalOverlay.classList.remove('active');
//                 document.body.style.overflow = '';
//             }

//         } else {
//             // handle error response
//             console.error("❌ Submision failed:", result);
//             alert('Error:' + (result.message || 'Failed to submit application.'))
//         }
//     } catch (error) {
//         console.error('Error submitting application:', error);
//         alert('An error occurred while submitting your application. Please try again later.');
//     } finally {
//         // Re-enable button
//         applicationSubmitBtn.disabled = false;
//         applicationSubmitBtn.textContent = 'Submit Application';

//     }

    
// });

// careerGeneralApplication.addEventListener('click', () => {
//     console.log("general")
//         applicationTitle.textContent = 'General Application';
//         applicationMeta.innerHTML = `
//                 <span>
//                         <i class="fa-solid fa-location-dot"></i> 
//                         <p id="location">Multiple Locations</p>
//                     </span>
//                     <span>
//                         <i class="fa-solid fa-briefcase"></i> 
//                         <p id="type">Various</p>
//                     </span>
//                     <span>
//                         <i class="fa-solid fa-building"></i> 
//                         <p id="position">Open Position</p>
//                     </span>
//             `;
//         if (modalOverlay) {
//             modalOverlay.classList.add('active');
//             document.body.style.overflow = 'hidden';
//         }

        
    
    

// });

// // ========== QUOTE SUBMISSION ==============
// form.addEventListener('submit', (e) => {
//     e.preventDefault();
   
//     const formData = new FormData(form);
//     const formObject = Object.fromEntries(formData.entries());

//     quoteSubmitBtn.disabled = true;
//     quoteSubmitBtn.innerHTML = 'Submitting...'
   
//     fetch('/api/quote', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(formObject)
//     })
//     .then(response => response.json())
//     .then(data => {
//         console.log("Quote response:", data);
//         if (data.quoteId) {
//             // show success message
//             successToastMessage.innerHTML = `
//                 <div class="toast-header">
//                     <p>Message Sent!</p>
//                 </div>
//                 <div class="toast-message">
//                     <p>We'll get back to you within 24 hrs.</p>
//                 </div>
//             `;
//             successToast.classList.add('show');

//             setTimeout(() => {
//                 successToast.classList.remove('show');
//             }, 4000);
//             // reset form
//             form.reset();

//             quoteSubmitBtn.disabled = false;
//             quoteSubmitBtn.innerHTML = 'SEND MESSAGE';

//         } else {
//             alert('Failed to submit quote request. Please try again later.');
//         }
//     })
//     .catch(error => {
//         console.error('Error submitting quote request:', error);
//         alert('An error occurred while submitting your quote request. Please try again later.');
//     });
    

//     setTimeout(() => {
//         successToast.classList.remove('show')
//     }, 3000)
    
// })






// careerPositions.forEach((pos, idx) => {
    
//     pos.addEventListener('click', () => {
//         const jobTitle = pos.querySelector('.career-info h4');
//         const fieldPosition = pos.querySelector('.career-info p');
//         const jobLocation = pos.querySelector('.info .city');
//         const jobStatus = pos.querySelector('.info .position-type');

//         applicationTitle.textContent = jobTitle.textContent;
//         applicationMeta.innerHTML = `
//             <span>
//                 <i class="fa-solid fa-location-dot"></i> 
//                     <p id="location">${jobLocation.textContent}</p>
//                 </span>
//                 <span>
//                 <i class="fa-solid fa-briefcase"></i> 
//                     <p id="type">${jobStatus.textContent}</p>
//                 </span>
//         `;

//         modalOverlay.classList.add('active')
//         document.body.style.overflow = 'none';
//     })
// })