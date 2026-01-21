
// Or use this more reliable approach with history
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);




const mobileMenuIcon = document.querySelector('.mobile-menu i');
const iconContainer = document.querySelector('.mobile-menu');
const mobileMenu = document.querySelector('.mobile-lg-menu');

const quoteForm = document.getElementById('quoteForm');
const quoteSubmitBtn = document.getElementById('quoteSubmitBtn');

const successToast = document.getElementById('successToast');
const successToastMessage = successToast.querySelector('.toast-content');

const form = document.getElementById('quoteinfo');

const careerPositions = document.querySelectorAll('.career-position');
const careerGeneralApplication = document.querySelector('.career-general-app');

const modalOverlay = document.querySelector('.modal-overlay')
const modalCloseBtn = document.querySelector('.close-btn');

const applicationTitle = document.querySelector('.application-position .position-title');
const applicationMeta = document.querySelector('.application-position .position-meta')
const applicationCancelBtn  = document.querySelector('.application-actions .cancel')
const applicationSubmitBtn = document.querySelector('.application-actions .submit')

const section = document.querySelector('#services');

const resumeInput = document.getElementById('resume');
const resumeButton = document.querySelector('.input-border');


// ========== ANIMATION ON SCROLL ==========
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        
        if (entry.isIntersecting) {
            const section = entry.target;
            const data = section.dataset;
            
            Object.keys(data).forEach(key => {
                console.log("Key:", key);
                if (key.startsWith('animateTarget')) {

                    const suffix = key.replace('animateTarget', '');
                    const className = `animateClass${suffix}`;
        
                    const selector = data[key];
                    const animateName = data[className];

                    console.log('target', selector)
                    console.log('animateName', animateName)

                    if (selector && animateName) {
                        const items = section.querySelectorAll(selector);
                        const animateClass = animateName.replace('.','');
                        // loop through and add animate class
                        items.forEach((item, index) => {
                            console.log("item:", item);
                            setTimeout(() => {
                                item.classList.add(animateClass);
                            }, index * 300) // stagger animation by 200ms
                        });
                    }
                }
                
                
            })

            
        } else {
            console.log("Sectin is out of view");
            
        }
    });
}, {
    threshold: 0.1
});

document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
})



// ========== RESUME UPLOAD HANDLING ==========
resumeButton.addEventListener('click', () => {
    resumeInput.click();
});

resumeInput.addEventListener('change', (event) => {
    const file = event.target.files[0];

    console.log("📁 File selected:", file);

    if  (file) {
        // check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size exceeds 5MB limit. Please choose a smaller file.');
            resumeInput.value = ''; // reset input
            return;
        } else {
            // check file type
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                alert('Invalid file type. Please upload a PDF, DOC, or DOCX file.');
                resumeInput.value = ''; // reset input
                return;
            }
        }

        resumeButton.innerHTML = `
            <i class="fa-solid fa-check-circle" style="color: #10b981"></i>
            <p style="color: #10b981"> ${file.name} selected</p>
            <p style="color: #666; font-size: 0.8rem;">(Click to change)</p>
        `;

        console.log("✅ File is valid:", file.name, file.size, "bytes");
    } else {
        resumeButton.innerHTML = `
            <i class="fa-solid fa-upload"></i>
            <p>Click to upload your resume</p>
            <p>PDF, DOC, or DOCX (Max 5MB)</p>
        `;
        console.log("No file selected");
    }
});

modalCloseBtn.addEventListener('click', () => {
    if(modalOverlay) {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = 'scroll'; 
        // Reset form
        document.getElementById('firstName').value = '';
        document.getElementById('lastName').value = '';
        document.getElementById('email').value = '';
        document.getElementById('phoneNumber').value = '';
        document.getElementById('linkedInProfile').value = '';
        document.getElementById('coverLetter').value = '';
    }

    

   
   
})

applicationCancelBtn.addEventListener('click', () => {
    if (modalOverlay) {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = 'scroll';
    }
   
})

applicationSubmitBtn.addEventListener('click', async () => {
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phoneNumber').value;
    const linkedInUrl = document.getElementById('linkedInProfile').value;
    const coverLetter = document.getElementById('coverLetter').value;
    const positionTitle = applicationTitle.textContent;
    const positionLocation = document.getElementById('location').textContent.trim();
    const positionType = document.getElementById('type').textContent.trim();
    
    const resumeFile = resumeInput.files[0]; // Get the selected file
    

    console.log("Submitting application for:", 
        "\nposition title: ", positionTitle,
        "\nlocation: ", positionLocation,
        "\nposition type: ", positionType,
        "\nfirstName: ", firstName,
        "\nlastName: ", lastName,
        "\nemail: ", email,
        "\nphone: ", phone,
        "\nlinkedInUrl: ", linkedInUrl,
        "\nresumeFile: ", resumeFile,  // ← This will now show the actual file object or undefined
        "\ncoverLetter: ", coverLetter
    );

    // Validation
    if (!firstName || !lastName || !email || !phone) {
        alert('Please fill in all required fields');
        return;
    }

    // Create FormData
    const formData = new FormData();
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('linkedInProfile', linkedInUrl);
    formData.append('coverLetter', coverLetter);
    formData.append('position', positionTitle);
    formData.append('location', positionLocation);
    formData.append('type', positionType);
    
    // Only append file if one was selected
    if (resumeFile) {
        formData.append('resume', resumeFile);
        console.log("Resume file attached:", resumeFile.name, resumeFile.size, "bytes");
    } else {
        console.log("No resume file selected (optional)");
    }

    // Disable button
    applicationSubmitBtn.disabled = true;
    applicationSubmitBtn.textContent = 'Submitting...';

    try {
        const response = await fetch('/api/applications', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok && result.success) {
            console.log("Application submitted:", result);

            // Show success 
            successToastMessage.innerHTML = `
                <div class="toast-header">
                    <p>Application Submitted!</p>
                </div>
                <div class="toast-message">
                    <p>Thank you for applying. We will review your application and get back to you soon.</p>
                </div>
            `;
            successToast.classList.add('show');

            setTimeout(() => {
                successToast.classList.remove('show');
            }, 4000);

            // Reset form
            document.getElementById('firstName').value = '';
            document.getElementById('lastName').value = '';
            document.getElementById('email').value = '';
            document.getElementById('phoneNumber').value = '';
            document.getElementById('linkedInProfile').value = '';
            document.getElementById('coverLetter').value = '';
            resumeInput.value = '';
            resumeButton.innerHTML = `
                <i class="fa-solid fa-upload"></i>
                <p>Click to upload your resume</p>
                <p>PDF, DOC, or DOCX (Max 5MB)</p>
            `;

            // Close modal
            if (modalOverlay) {
                modalOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }

        } else {
            // handle error response
            console.error("❌ Submision failed:", result);
            alert('Error:' + (result.message || 'Failed to submit application.'))
        }
    } catch (error) {
        console.error('Error submitting application:', error);
        alert('An error occurred while submitting your application. Please try again later.');
    } finally {
        // Re-enable button
        applicationSubmitBtn.disabled = false;
        applicationSubmitBtn.textContent = 'Submit Application';

    }

    
});

careerGeneralApplication.addEventListener('click', () => {
    console.log("general")
        applicationTitle.textContent = 'General Application';
        applicationMeta.innerHTML = `
                <span>
                        <i class="fa-solid fa-location-dot"></i> 
                        <p id="location">Multiple Locations</p>
                    </span>
                    <span>
                        <i class="fa-solid fa-briefcase"></i> 
                        <p id="type">Various</p>
                    </span>
                    <span>
                        <i class="fa-solid fa-building"></i> 
                        <p id="position">Open Position</p>
                    </span>
            `;
        if (modalOverlay) {
            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        
    
    

})

careerPositions.forEach((pos, idx) => {
    
    pos.addEventListener('click', () => {
        const jobTitle = pos.querySelector('.career-info h4');
        const fieldPosition = pos.querySelector('.career-info p');
        const jobLocation = pos.querySelector('.info .city');
        const jobStatus = pos.querySelector('.info .position-type');

        applicationTitle.textContent = jobTitle.textContent;
        applicationMeta.innerHTML = `
            <span>
                <i class="fa-solid fa-location-dot"></i> 
                    <p id="location">${jobLocation.textContent}</p>
                </span>
                <span>
                <i class="fa-solid fa-briefcase"></i> 
                    <p id="type">${jobStatus.textContent}</p>
                </span>
        `;

        modalOverlay.classList.add('active')
        document.body.style.overflow = 'none';
    })
})

iconContainer.addEventListener('click', () => {
    const icon = iconContainer.querySelector('i');

    if(mobileMenu.classList.contains('active')) {

        mobileMenu.classList.remove('active');
        icon.className = 'fa-solid fa-bars';
    } else {
        
        mobileMenu.classList.add('active');
        icon.className = 'fa-solid fa-xmark';
    }
    
})

form.addEventListener('submit', (e) => {
    e.preventDefault();
   
    const formData = new FormData(form);
    const formObject = Object.fromEntries(formData.entries());

    quoteSubmitBtn.disabled = true;
    quoteSubmitBtn.innerHTML = 'Submitting...'
   
    fetch('/api/quote', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formObject)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Quote response:", data);
        if (data.quoteId) {
            // show success message
            successToastMessage.innerHTML = `
                <div class="toast-header">
                    <p>Message Sent!</p>
                </div>
                <div class="toast-message">
                    <p>We'll get back to you within 24 hrs.</p>
                </div>
            `;
            successToast.classList.add('show');

            setTimeout(() => {
                successToast.classList.remove('show');
            }, 4000);
            // reset form
            form.reset();

            quoteSubmitBtn.disabled = false;
            quoteSubmitBtn.innerHTML = 'SEND MESSAGE';
            
        } else {
            alert('Failed to submit quote request. Please try again later.');
        }
    })
    .catch(error => {
        console.error('Error submitting quote request:', error);
        alert('An error occurred while submitting your quote request. Please try again later.');
    });
    

    setTimeout(() => {
        successToast.classList.remove('show')
    }, 3000)
    
})

window.addEventListener('scroll', function() {
    const navbar = this.document.querySelector('header');

    if (this.window.scrollY > 200) {
        navbar.classList.add('scrolled')
    } else {
        navbar.classList.remove('scrolled')
    }
})




