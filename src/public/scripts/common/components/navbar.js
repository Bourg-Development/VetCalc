// public/js/navbar.js

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu elements
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navbarNav = document.getElementById('navbar-nav');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');

    // Desktop user menu elements
    const userMenuToggle = document.getElementById('user-menu-toggle');
    const userDropdown = document.getElementById('user-dropdown');

    // Mobile menu functionality
    if (mobileMenuToggle && navbarNav && mobileMenuOverlay) {
        function toggleMobileMenu() {
            const isActive = navbarNav.classList.contains('active');

            if (isActive) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        }

        function openMobileMenu() {
            navbarNav.classList.add('active');
            mobileMenuOverlay.classList.add('active');
            mobileMenuToggle.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }

        function closeMobileMenu() {
            navbarNav.classList.remove('active');
            mobileMenuOverlay.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        }

        // Toggle mobile menu on button click
        mobileMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMobileMenu();
        });

        // Close mobile menu when clicking overlay
        mobileMenuOverlay.addEventListener('click', closeMobileMenu);

        // Close mobile menu when clicking nav links
        const navLinks = navbarNav.querySelectorAll('.nav-link, .mobile-user-item');
        navLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        // Close mobile menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navbarNav.classList.contains('active')) {
                closeMobileMenu();
            }
        });

        // Close mobile menu on window resize if screen becomes larger
        window.addEventListener('resize', function() {
            if (window.innerWidth >= 768 && navbarNav.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    }

    // Desktop user menu functionality
    if (userMenuToggle && userDropdown) {
        function toggleUserDropdown() {
            userDropdown.classList.toggle('show');
        }

        function closeUserDropdown() {
            userDropdown.classList.remove('show');
        }

        // Toggle dropdown on click
        userMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleUserDropdown();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!userMenuToggle.contains(e.target) && !userDropdown.contains(e.target)) {
                closeUserDropdown();
            }
        });

        // Close dropdown on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && userDropdown.classList.contains('show')) {
                closeUserDropdown();
            }
        });

        // Close dropdown when window loses focus
        window.addEventListener('blur', closeUserDropdown);
    }

    // Add smooth scrolling for anchor links (if any)
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const headerOffset = document.querySelector('.main-navbar').offsetHeight;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // Close mobile menu if open
                    if (navbarNav && navbarNav.classList.contains('active')) {
                        closeMobileMenu();
                    }
                }
            }
        });
    });

    // Update active nav item based on current page (optional enhancement)
    function updateActiveNavItem() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            const linkPath = new URL(link.href).pathname;
            if (linkPath === currentPath || (currentPath === '/' && linkPath === '/')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Call on page load and when navigating (for SPAs)
    updateActiveNavItem();
    window.addEventListener('popstate', updateActiveNavItem);

    // Add loading states for navigation links (optional enhancement)
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Add a subtle loading indicator
            const text = this.querySelector('.nav-text');
            if (text) {
                const originalText = text.textContent;
                text.style.opacity = '0.7';

                // Reset after navigation (for non-SPA apps)
                setTimeout(() => {
                    text.style.opacity = '1';
                }, 100);
            }
        });
    });
});