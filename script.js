document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       Sticky Navbar Blur & Mobile Menu
       ========================================================================== */
    const navbar = document.getElementById('navbar');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navLinkItems = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = hamburger.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    navLinkItems.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.querySelector('i').classList.remove('fa-times');
            hamburger.querySelector('i').classList.add('fa-bars');
        });
    });

    /* ==========================================================================
       Intersection Observer for Scroll Animations
       ========================================================================== */
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    /* ==========================================================================
       Gallery Filtering
       ========================================================================== */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (filterBtns.length && galleryItems.length) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                galleryItems.forEach(item => {
                    if (filterValue === 'all' || item.classList.contains(filterValue)) {
                        item.style.display = 'block';
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'scale(1)';
                        }, 50);
                    } else {
                        item.style.opacity = '0';
                        item.style.transform = 'scale(0.8)';
                        setTimeout(() => {
                            item.style.display = 'none';
                        }, 400); // match transition duration
                    }
                });
            });
        });
    }

    /* ==========================================================================
       Lightbox for Gallery
       ========================================================================== */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeLightbox = document.querySelector('.close-lightbox');

    if (lightbox && lightboxImg && lightboxCaption && closeLightbox && galleryItems.length) {
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const imgUrl = item.querySelector('img').src;
                const textElement = item.querySelector('.text-white');
                const text = textElement ? textElement.innerText : '';

                lightboxImg.src = imgUrl;
                lightboxCaption.innerText = text;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden'; // prevent scrolling
            });
        });

        closeLightbox.addEventListener('click', closeLightboxFunc);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightboxFunc();
        });

        function closeLightboxFunc() {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    /* ==========================================================================
       Testimonial Carousel (Auto-sliding with dots + arrows)
       ========================================================================== */
    const carouselEl = document.querySelector('.testimonial-carousel');
    const track = document.querySelector('.testimonial-track');
    const dotsContainer = document.querySelector('.testimonial-dots');
    const prevBtn = document.querySelector('.testimonial-prev');
    const nextBtn = document.querySelector('.testimonial-next');

    if (carouselEl && track && dotsContainer) {
        const slides = track.querySelectorAll('.testimonial-slide');
        const dots = dotsContainer.querySelectorAll('.testimonial-dot');
        const total = slides.length;

        let current = Array.from(slides).findIndex(s => s.classList.contains('active'));
        if (current < 0) current = 0;

        let autoTimer = null;
        const AUTO_DELAY = 6000;

        function goTo(index, fromUser = false) {
            const next = (index + total) % total;
            if (next === current) return;

            slides[current].classList.remove('active');
            if (dots[current]) {
                dots[current].classList.remove('active');
                dots[current].setAttribute('aria-selected', 'false');
            }

            current = next;

            slides[current].classList.add('active');
            if (dots[current]) {
                dots[current].classList.add('active');
                dots[current].setAttribute('aria-selected', 'true');
            }

            if (fromUser) restartAuto();
        }

        function next() { goTo(current + 1); }
        function prev() { goTo(current - 1, true); }

        function startAuto() {
            stopAuto();
            autoTimer = setInterval(next, AUTO_DELAY);
        }
        function stopAuto() {
            if (autoTimer) {
                clearInterval(autoTimer);
                autoTimer = null;
            }
        }
        function restartAuto() {
            stopAuto();
            startAuto();
        }

        // Pause on hover
        carouselEl.addEventListener('mouseenter', stopAuto);
        carouselEl.addEventListener('mouseleave', startAuto);

        // Pause when off-screen, resume when visible
        if ('IntersectionObserver' in window) {
            const visibilityObserver = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) startAuto();
                    else stopAuto();
                });
            }, { threshold: 0.1 });
            visibilityObserver.observe(carouselEl);
        }

        // Start auto-rotation immediately
        startAuto();

        // Arrow buttons
        if (prevBtn) prevBtn.addEventListener('click', prev);
        if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1, true));

        // Dots
        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => goTo(i, true));
        });

        // Keyboard support
        carouselEl.setAttribute('tabindex', '0');
        carouselEl.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') prev();
            else if (e.key === 'ArrowRight') goTo(current + 1, true);
        });

        // Touch / swipe support
        let touchStartX = 0;
        let touchEndX = 0;
        track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) goTo(current + 1, true);
                else prev();
            }
        }, { passive: true });
    }

    /* ==========================================================================
       FAQ Accordion
       ========================================================================== */
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            
            // Close other open items
            const openHeaders = document.querySelectorAll('.accordion-header.active');
            openHeaders.forEach(openHeader => {
                if (openHeader !== header) {
                    openHeader.classList.remove('active');
                    openHeader.nextElementSibling.style.maxHeight = null;
                }
            });

            // Toggle current item
            header.classList.toggle('active');
            if (header.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.style.maxHeight = null;
            }
        });
    });

    /* ==========================================================================
       Form Validation & Submission Simulation
       ========================================================================== */
    const customForm = document.getElementById('custom-order-form');
    const formMessage = document.querySelector('.form-message');

    if (customForm) {
        customForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = customForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            
            submitBtn.innerText = 'Sending Inquiry...';
            submitBtn.disabled = true;

            // Simulate API call
            setTimeout(() => {
                customForm.reset();
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
                
                formMessage.style.color = '#B76E79'; // Rose gold
                formMessage.innerText = 'Thank you! Your custom inquiry has been received. Our artist will contact you shortly.';
                
                setTimeout(() => {
                    formMessage.innerText = '';
                }, 5000);
            }, 1500);
        });
    }

});
