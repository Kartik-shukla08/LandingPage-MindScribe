document.addEventListener('DOMContentLoaded', () => {
    
    // --- FAQ Accordion Logic ---
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        const answerDiv = item.querySelector('.faq-answer');

        questionBtn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Optional: Close all other items first for a cleaner "accordion" look
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-answer').style.maxHeight = null;
                }
            });

            // Toggle current item
            if (isActive) {
                item.classList.remove('active');
                answerDiv.style.maxHeight = null;
            } else {
                item.classList.add('active');
                // Set max-height to the scrollHeight of the content for smooth animation
                answerDiv.style.maxHeight = answerDiv.scrollHeight + "px";
            }
        });
    });

    // --- Experience Section Hover Video Swap ---
    const experienceVideo = document.getElementById('experience-video');
    const experienceSteps = document.querySelectorAll('.experience-section .step-item');

    if (experienceVideo && experienceSteps.length) {
        const setActiveStep = (step) => {
            experienceSteps.forEach(item => item.classList.remove('is-active'));
            step.classList.add('is-active');
        };

        const updateExperienceVideo = (step) => {
            const nextVideo = step.dataset.video;
            const nextPoster = step.dataset.poster;

            if (!nextVideo || experienceVideo.getAttribute('src') === nextVideo) {
                return;
            }

            experienceVideo.setAttribute('src', nextVideo);

            if (nextPoster) {
                experienceVideo.setAttribute('poster', nextPoster);
            }

            experienceVideo.load();
            experienceVideo.play().catch(() => {
            });
        };

        experienceSteps.forEach((step, index) => {
            if (index === 0) {
                step.classList.add('is-active');
            }

            step.addEventListener('mouseenter', () => {
                setActiveStep(step);
                updateExperienceVideo(step);
            });

            step.addEventListener('focusin', () => {
                setActiveStep(step);
                updateExperienceVideo(step);
            });
        });
    }

    const contactForm = document.querySelector('.contact-form');
    const submitButton = contactForm?.querySelector('button[type="submit"]');
    const formStatus = contactForm?.querySelector('.form-status');
    const appsScriptEndpoint = 'https://script.google.com/macros/s/AKfycbwcBmkVkRiqxMf8eEtpKTTJSBD6ptOgrdd2n4_phbiM2PpWU-GzcJgysuoBTZXhjUdB/exec';

    if (contactForm && submitButton) {
        const setFormStatus = (message, type) => {
            if (!formStatus) {
                return;
            }

            formStatus.textContent = message;
            formStatus.classList.remove('is-success', 'is-error');

            if (type) {
                formStatus.classList.add(type);
            }
        };

        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');

            const payload = {
                name: nameInput?.value.trim() || '',
                email: emailInput?.value.trim() || '',
                message: messageInput?.value.trim() || ''
            };

            if (!payload.name || !payload.email || !payload.message) {
                setFormStatus('Please fill in all fields before sending your message.', 'is-error');
                return;
            }

            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            setFormStatus('Sending your message...', '');

            try {
                const response = await fetch(appsScriptEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain;charset=utf-8'
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error('Primary submission failed.');
                }

                contactForm.reset();
                setFormStatus('Message sent successfully.', 'is-success');
            } catch (error) {
                try {
                    await fetch(appsScriptEndpoint, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: {
                            'Content-Type': 'text/plain;charset=utf-8'
                        },
                        body: JSON.stringify(payload)
                    });

                    contactForm.reset();
                    setFormStatus('Message sent successfully.', 'is-success');
                } catch (fallbackError) {
                    setFormStatus('We could not send your message right now. Please try again in a moment.', 'is-error');
                }
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }

    const lockIllustration = document.querySelector('.lock-illustration');
    const privacyToken = lockIllustration?.querySelector('.privacy-token');

    if (lockIllustration && privacyToken && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const ball = privacyToken.querySelector('.privacy-orbit');

        if (ball) {
            const maxTilt = 28;
            let ballX = 0;
            let ballY = 0;
            let velX = 0;
            let velY = 0;
            let gravityX = 0;
            let gravityY = 0;
            let lastTime = null;
            let radius = (privacyToken.offsetWidth || 220) * 0.32;

            const updateRadius = () => {
                radius = (privacyToken.offsetWidth || 220) * 0.32;
            };

            window.addEventListener('resize', updateRadius);
            updateRadius();

            const step = (timestamp) => {
                if (lastTime === null) {
                    lastTime = timestamp;
                }

                const delta = Math.min((timestamp - lastTime) / 1000, 0.03);
                lastTime = timestamp;

                const accelStrength = 420;
                velX += gravityX * accelStrength * delta;
                velY += gravityY * accelStrength * delta;

                const damping = 3;
                velX *= 1 - damping * delta;
                velY *= 1 - damping * delta;

                ballX += velX * delta;
                ballY += velY * delta;

                const dist = Math.hypot(ballX, ballY);
                if (dist > radius && dist > 0) {
                    const scale = radius / dist;
                    ballX *= scale;
                    ballY *= scale;

                    const nx = ballX / dist;
                    const ny = ballY / dist;
                    const dot = velX * nx + velY * ny;
                    if (dot > 0) {
                        const bounce = 1.1;
                        velX -= bounce * dot * nx;
                        velY -= bounce * dot * ny;
                    }
                }

                ball.style.setProperty('--ball-x', `${ballX}px`);
                ball.style.setProperty('--ball-y', `${ballY}px`);

                requestAnimationFrame(step);
            };

            requestAnimationFrame(step);

            lockIllustration.addEventListener('mousemove', (event) => {
                const bounds = lockIllustration.getBoundingClientRect();
                const x = (event.clientX - bounds.left) / bounds.width;
                const y = (event.clientY - bounds.top) / bounds.height;

                const tiltX = (0.5 - y) * maxTilt;
                const tiltY = (x - 0.5) * maxTilt;

                privacyToken.classList.add('is-active');
                privacyToken.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.1)`;

                gravityX = tiltY / maxTilt;
                gravityY = -tiltX / maxTilt;
            });

            lockIllustration.addEventListener('mouseleave', () => {
                privacyToken.classList.remove('is-active');
                privacyToken.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
                gravityX = 0;
                gravityY = 0;
            });
        }
    }


    // --- Scroll Animations using Intersection Observer ---
    // Select elements to animate
    const animatedElements = document.querySelectorAll('.animate-on-load, .animate-left, .animate-right, .fade-up');

    const observerOptions = {
        root: null, // Use viewport as root
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of element is visible
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // Trigger initial load animations specifically for header
    setTimeout(() => {
        document.querySelector('header').classList.add('is-visible');
    }, 100);

});