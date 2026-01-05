const mobileMenuBtn = document.querySelector('.mobile-menu i');
const mobileMenu = document.querySelector('.mobile-lg-menu');

mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.add('active');
})

window.addEventListener('scroll', function() {
    const navbar = this.document.querySelector('header');

    if (this.window.scrollY > 200) {
        navbar.classList.add('scrolled')
    } else {
        navbar.classList.remove('scrolled')
    }
})

