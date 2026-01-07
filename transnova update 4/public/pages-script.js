// ===================================
// PAGES SCRIPT - TRANSNOVA COURIERS
// ===================================

// Update menu items to navigate to pages
const menuItemsPages = document.querySelectorAll(".menu-item");
menuItemsPages.forEach((item) => {
    item.addEventListener("click", () => {
        const page = item.getAttribute("data-page");
        if (page) {
            window.location.href = page;
        }
    });
});

// ===================================
// TESTIMONIALS SLIDER FUNCTIONALITY
// ===================================
let currentTestimonial = 0;
const testimonials = document.querySelectorAll(".testimonial-card");
const prevBtn = document.getElementById("prevTestimonial");
const nextBtn = document.getElementById("nextTestimonial");
const dotsContainer = document.getElementById("sliderDots");

if (testimonials.length > 0) {
    // Create dots
    testimonials.forEach((_, index) => {
        const dot = document.createElement("div");
        dot.classList.add("slider-dot");
        if (index === 0) dot.classList.add("active");
        dot.addEventListener("click", () => goToTestimonial(index));
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll(".slider-dot");

    function showTestimonial(index) {
        testimonials.forEach((testimonial, i) => {
            testimonial.classList.remove("active");
            dots[i].classList.remove("active");
        });

        testimonials[index].classList.add("active");
        dots[index].classList.add("active");
        currentTestimonial = index;
    }

    function nextTestimonial() {
        let next = currentTestimonial + 1;
        if (next >= testimonials.length) next = 0;
        showTestimonial(next);
    }

    function prevTestimonial() {
        let prev = currentTestimonial - 1;
        if (prev < 0) prev = testimonials.length - 1;
        showTestimonial(prev);
    }

    function goToTestimonial(index) {
        showTestimonial(index);
    }

    if (prevBtn) prevBtn.addEventListener("click", prevTestimonial);
    if (nextBtn) nextBtn.addEventListener("click", nextTestimonial);

    // Auto-slide every 6 seconds
    setInterval(nextTestimonial, 6000);
}

// ===================================
// GALLERY LIGHTBOX FUNCTIONALITY
// ===================================
const galleryItems = document.querySelectorAll(".gallery-item");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxTitle = document.getElementById("lightbox-title");
const lightboxDescription = document.getElementById("lightbox-description");
let currentImageIndex = 0;

function openLightbox(element) {
    const img = element.querySelector("img");
    const title = element.querySelector("h3").textContent;
    const description = element.querySelector("p").textContent;

    lightboxImg.src = img.src;
    lightboxTitle.textContent = title;
    lightboxDescription.textContent = description;

    currentImageIndex = Array.from(galleryItems).indexOf(element);

    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeLightbox() {
    lightbox.classList.remove("active");
    document.body.style.overflow = "auto";
}

function navigateLightbox(direction, event) {
    event.stopPropagation();

    currentImageIndex += direction;

    if (currentImageIndex < 0) {
        currentImageIndex = galleryItems.length - 1;
    } else if (currentImageIndex >= galleryItems.length) {
        currentImageIndex = 0;
    }

    const currentItem = galleryItems[currentImageIndex];
    const img = currentItem.querySelector("img");
    const title = currentItem.querySelector("h3").textContent;
    const description = currentItem.querySelector("p").textContent;

    lightboxImg.src = img.src;
    lightboxTitle.textContent = title;
    lightboxDescription.textContent = description;
}

// Keyboard navigation for lightbox
document.addEventListener("keydown", (e) => {
    if (lightbox.classList.contains("active")) {
        if (e.key === "Escape") {
            closeLightbox();
        } else if (e.key === "ArrowLeft") {
            navigateLightbox(-1, e);
        } else if (e.key === "ArrowRight") {
            navigateLightbox(1, e);
        }
    }
});

// ===================================
// CONTACT FORM FUNCTIONALITY
// ===================================
const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");

if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = {
            name: document.getElementById("name").value.trim(),
            email: document.getElementById("email").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            subject: document.getElementById("subject").value.trim(),
            message: document.getElementById("message").value.trim(),
        };

        // Basic validation
        if (
            !formData.name ||
            !formData.email ||
            !formData.subject ||
            !formData.message
        ) {
            showFormMessage("Please fill in all required fields.", "error");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showFormMessage("Please enter a valid email address.", "error");
            return;
        }

        try {
            // IMPORTANT: Replace this URL with your actual Express backend endpoint
            const response = await fetch(
                "YOUR_EXPRESS_BACKEND_URL/api/contact",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                },
            );

            if (response.ok) {
                showFormMessage(
                    "Thank you! Your message has been sent successfully. We'll get back to you soon.",
                    "success",
                );
                contactForm.reset();
            } else {
                throw new Error("Failed to send message");
            }
        } catch (error) {
            console.error("Contact form error:", error);

            // For demonstration - remove this and uncomment the error message below
            showFormMessage(
                "Message submitted successfully! (Demo mode - please connect to backend)",
                "success",
            );
            contactForm.reset();

            // Uncomment this for production with real backend
            // showFormMessage('Sorry, there was an error sending your message. Please try again later or contact us directly.', 'error');
        }
    });
}

function showFormMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;

    // Scroll to message
    formMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });

    // Hide message after 5 seconds if success
    if (type === "success") {
        setTimeout(() => {
            formMessage.className = "form-message";
        }, 5000);
    }
}

// ===================================
// ANIMATION ON SCROLL (AOS)
// ===================================
const animateOnScroll = () => {
    const elements = document.querySelectorAll("[data-aos]");

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px",
        },
    );

    elements.forEach((element) => {
        element.style.opacity = "0";

        const animationType = element.getAttribute("data-aos");
        const delay = element.getAttribute("data-aos-delay") || 0;

        element.style.transitionDelay = `${delay}ms`;

        switch (animationType) {
            case "fade-up":
                element.style.transform = "translateY(50px)";
                break;
            case "fade-right":
                element.style.transform = "translateX(-50px)";
                break;
            case "fade-left":
                element.style.transform = "translateX(50px)";
                break;
            case "zoom-in":
                element.style.transform = "scale(0.8)";
                break;
        }

        element.style.transition = "opacity 0.8s ease, transform 0.8s ease";

        observer.observe(element);
    });
};

// Initialize animations when DOM is loaded
document.addEventListener("DOMContentLoaded", animateOnScroll);

// ===================================
// SMOOTH SCROLL TO TOP
// ===================================
const backToTopBtn = document.getElementById("backToTop");

if (backToTopBtn) {
    window.addEventListener("scroll", () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add("visible");
        } else {
            backToTopBtn.classList.remove("visible");
        }
    });

    backToTopBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    });
}

// ===================================
// PERFORMANCE OPTIMIZATION
// ===================================
// Lazy load images
const lazyLoadImages = () => {
    const images = document.querySelectorAll("img[data-src]");

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute("data-src");
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach((img) => imageObserver.observe(img));
};

document.addEventListener("DOMContentLoaded", lazyLoadImages);

console.log("TransNova Pages Scripts Loaded Successfully!");
