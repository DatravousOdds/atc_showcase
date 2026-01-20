
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


resumeButton.addEventListener('click', () => {
    resumeInput.click();
});

resumeInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    console.log("Selected file:", file);
    if (file && file.size < 2 * 1024 * 1024) { // limit file size to 2MB
        // get file url
        const fileURL = URL.createObjectURL(file);
        console.log("Selected file URL:", fileURL);

        resumeButton.innerHTML = `<i class="fa-solid fa-file"></i>
        <p>${file.name}</p>


        `;
    }
});

modalCloseBtn.addEventListener('click', () => {
    if(modalOverlay) {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = 'scroll'; 
    }
   
   
})

applicationCancelBtn.addEventListener('click', () => {
    if (modalOverlay) {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = 'scroll';
    }
   
})

applicationSubmitBtn.addEventListener('click', async () => {  // ← Added async
    // Get form values
    const firstName = document.getElementById('firstName').value,
          lastName = document.getElementById('lastName').value,
          email = document.getElementById('email').value,
          phone = document.getElementById('phoneNumber').value,
          linkedInProfile = document.getElementById('linkedInProfile').value,
          coverLetter = document.getElementById('coverLetter').value || null;

    const type = applicationMeta.querySelector('span:nth-child(2)').textContent.trim(),
          position = applicationTitle.textContent,
          location = applicationMeta.querySelector('span:nth-child(1)').textContent.trim();

    // Handle resume upload
    let resumePath = null;
    const resumeFile = resumeInput.files[0];

    if (resumeFile) { 
        try {
            const formData = new FormData();
            formData.append('resume', resumeFile);

            // Upload resume to server
            const uploadResponse = await fetch('/api/uploadResume', {
                method: 'POST',
                body: formData
            });
            
            const uploadResult = await uploadResponse.json();
            resumePath = uploadResult.filePath;
            console.log("Uploaded resume path:", resumePath);

        } catch (err) {
            console.error('Error uploading resume:', err);
            alert('An error occurred while uploading your resume. Please try again later.');
            return;
        }
    }

    // Build application data
    const applicationData = {
        firstName,
        lastName,
        email,
        phone_number: phone,
        linkedInProfile,
        resume: resumePath,
        coverLetter,
        position,
        location,
        type,
        job_status: 'pending'
    };
        
    console.log("Submitting application:", applicationData);

    // Submit application
    try {
        const response = await fetch('/api/apply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(applicationData)
        });

        const result = await response.json();
        console.log("Application response:", result);

        if (result.applicationId) {
            // Show success message
            successToastMessage.innerHTML = `
                <div class="toast-header">
                    <p>Application Submitted!</p>
                </div>
                <div class="toast-message">
                    <p>Thank you for applying. We'll review your application and get back to you soon.</p>
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
                <i class="fa-solid fa-cloud-arrow-up"></i>
                <p>Upload Resume (Max 2MB)</p>
            `;

            // Close modal
            if (modalOverlay) {
                modalOverlay.classList.remove('active');
                document.body.style.overflow = 'scroll';
            }

        } else {
            alert('Failed to submit application. Please try again later.');
        }
            
    } catch (err) {
        console.error('Error submitting application:', err);
        alert('An error occurred while submitting your application. Please try again later.');
    }
});

careerGeneralApplication.addEventListener('click', () => {
    console.log("general")
        applicationTitle.textContent = 'General Application';
        applicationMeta.innerHTML = `
                <span>
                        <i class="fa-solid fa-location-dot"></i> 
                        Multiple Locations
                    </span>
                    <span>
                        <i class="fa-solid fa-briefcase"></i> 
                        Various
                    </span>
                    <span>
                        <i class="fa-solid fa-building"></i> 
                        Open Position
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
                    ${jobLocation.textContent}
                </span>
                <span>
                <i class="fa-solid fa-briefcase"></i> 
                    ${jobStatus.textContent}
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
            // reset form
            form.reset();
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




