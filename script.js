document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector("nav");
    const header = document.querySelector("header");
    const navLinks = document.querySelectorAll("nav ul li a");
    const accordionTitles = document.querySelectorAll('.accordion_title');
    const homeSection = document.getElementById("home");
    const layers = document.querySelectorAll("#home .layer");
    const parallaxSpeeds = [0.5, 0.4, 0.3, 0.4, 0.5, 0.6];
    let lastScrollTop = 0;
    const scrollBtn = document.getElementById("scrollToTop");
    const scrollToTopBtn = document.getElementById("scrollToTopBtn");

    // Scroll-based behaviors
    window.addEventListener("scroll", () => {
        const scrolled = window.scrollY;

        if (scrollToTopBtn) {
            scrollToTopBtn.style.display = scrolled > 300 ? "block" : "none";
        }

        if (scrollBtn) {
            if (scrolled > 300) {
                scrollBtn.style.display = "block";
                scrollBtn.style.opacity = "1";
            } else {
                scrollBtn.style.opacity = "0";
                setTimeout(() => {
                    if (scrollBtn.style.opacity === "0") {
                        scrollBtn.style.display = "none";
                    }
                }, 300);
            }
        }

        if (scrolled > lastScrollTop) {
            header.style.top = `-${header.offsetHeight}px`;
        } else {
            header.style.top = "0";
        }
        lastScrollTop = Math.max(scrolled, 0);

        if (homeSection && scrolled <= homeSection.offsetHeight) {
            layers.forEach((layer, index) => {
                const speed = parallaxSpeeds[index] || 0.1;
                layer.style.transform = `translateY(${scrolled * speed}px)`;
            });
        }
    });

    if (menuToggle) {
        menuToggle.addEventListener("click", () => {
            nav.classList.toggle("active");
        });
    }

    navLinks.forEach(link => {
        link.addEventListener("click", () => nav.classList.remove("active"));
    });

    const footerLinks = document.querySelectorAll(".footer-nav li a");
    footerLinks.forEach(link => {
        link.addEventListener("click", () => {
            nav.classList.remove("active");
        });
    });

    accordionTitles.forEach(title => {
        title.addEventListener("click", () => {
            const content = title.nextElementSibling;
            if (!content) return;

            const isOpen = title.classList.contains("open");

            accordionTitles.forEach(otherTitle => {
                if (otherTitle !== title) {
                    otherTitle.classList.remove("open");
                    const otherContent = otherTitle.nextElementSibling;
                    if (otherContent) {
                        otherContent.classList.remove("active");
                        otherContent.style.maxHeight = null;
                    }
                }
            });

            title.classList.toggle("open");
            if (!isOpen) {
                content.classList.add("active");
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.classList.remove("active");
                content.style.maxHeight = null;
            }
        });
    });

    // Scroll-triggered animation 
    const animateSteps = () => {
        const steps = document.querySelectorAll('.step');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const step = entry.target;
                    step.classList.add('reveal');

                    const children = step.children;
                    for (let i = 0; i < children.length; i++) {
                        children[i].classList.add('reveal');
                    }

                    observer.unobserve(step);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        });

        steps.forEach(step => {
            const hasBox = Array.from(step.children).some(child =>
                child.offsetWidth > 0 && child.offsetHeight > 0
            );

            if (hasBox) {
                observer.observe(step);
            }
        });
    };

    const animateOnScroll = (selector, threshold = 0.2) => {
        const elements = document.querySelectorAll(selector);
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            threshold,
            rootMargin: "0px 0px -50px 0px"
        });

        elements.forEach(el => {
            const hasBoundingBox = el.offsetWidth > 0 && el.offsetHeight > 0;
            if (hasBoundingBox) {
                observer.observe(el);
            }
        });
    };

    animateOnScroll('.feature-card');
    animateSteps();
    animateOnScroll('.contact-card');

    // VIDEO AUTOPLAY + SOUND LOGIC
    const walkthroughVideo = document.getElementById("walkthroughVideo");
    let hasUserInteracted = false;
    let hasVideoBeenActivated = false;

    const setUserInteracted = () => {
        hasUserInteracted = true;
    };

    // Capture user interaction for autoplay with sound
    window.addEventListener("click", setUserInteracted);
    window.addEventListener("keydown", setUserInteracted);
    window.addEventListener("touchstart", setUserInteracted);

    const tryPlayVideo = () => {
        if (!walkthroughVideo) return;

        if (hasUserInteracted && !hasVideoBeenActivated) {
            walkthroughVideo.muted = false;
            walkthroughVideo.play().then(() => {
                hasVideoBeenActivated = true;
            }).catch(err => {
                console.warn("Autoplay with sound failed, retrying muted:", err);
                walkthroughVideo.muted = true;
                walkthroughVideo.play().catch(() => {});
            });
        } else {
            walkthroughVideo.play().catch(() => {});
        }
    };

    if (walkthroughVideo) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    tryPlayVideo();
                } else {
                    walkthroughVideo.pause();
                }
            });
        }, {
            threshold: 0.4,
            rootMargin: "0px 0px -100px 0px"
        });

        walkthroughVideo.addEventListener("loadeddata", () => {
            observer.observe(walkthroughVideo);

            // In case already visible on load
            const rect = walkthroughVideo.getBoundingClientRect();
            const inView = rect.top < window.innerHeight && rect.bottom > 0;
            if (inView && hasUserInteracted) {
                tryPlayVideo();
            }
        });

        // Fallback- allow user to click the video directly to unmute/play
        walkthroughVideo.addEventListener("click", () => {
            hasUserInteracted = true;
            walkthroughVideo.muted = false;
            walkthroughVideo.play().catch(() => {});
        });
    }
});
