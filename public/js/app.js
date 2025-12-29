const mobileMenuBtn = document.querySelector('.mobile-menu i');
const mobileMenu = document.querySelector('.mobile-lg-menu');

mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.add('active');
})

