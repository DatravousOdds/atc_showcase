
// Or use this more reliable approach with history
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);




const mobileMenuIcon = document.querySelector('.mobile-menu i');
const iconContainer = document.querySelector('.mobile-menu');
const mobileMenu = document.querySelector('.mobile-lg-menu');
const quoteSubmitBtn = document.getElementById('quoteSubmitBtn');
const successToast = document.getElementById('successToast');
const form = document.getElementById('quoteinfo');
const careerPositions = document.querySelectorAll('.career-position');
const modalOverlay = document.querySelector('.modal-overlay')
const modalCloseBtn = document.querySelector('.close-btn');
const applicationTitle = document.querySelector('.application-position .position-title');
const applicationMeta = document.querySelector('.application-position .position-meta')
const applicationCancelBtn  = document.querySelector('.application-actions .cancel')
const careerGeneralApplication = document.querySelector('.career-general-app');
const section = document.querySelector('#services');



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
    // console.log("section:", el)
    observer.observe(el)
})

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
    // send email 
    sendData();
    // show toast notification
    if (sendData()) {
        successToast.classList.add('show');
    }

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


function sendData() {
    return true;
}

