// script.js - TransNova Courier Website

// ===================================
// GOOGLE TRANSLATE INITIALIZATION
// ===================================
function googleTranslateElementInit() {
    new google.translate.TranslateElement(
        {
            pageLanguage: "en",
            includedLanguages: "en,es,fr,de,it,pt,ru,ja,zh-CN,ar,hi,ko,tr",
        },
        "google_translate_element",
    );
}

// ===================================
// LANGUAGE SELECTOR FUNCTIONALITY
// ===================================
const languageSelector = document.getElementById("languageSelector");
const languageDropdown = document.getElementById("languageDropdown");
const languageOptions = document.querySelectorAll(".language-option");

// Language code mapping
const languageCodeMap = {
    en: "en",
    es: "es",
    fr: "fr",
    de: "de",
    it: "it",
    pt: "pt",
    ru: "ru",
    ja: "ja",
    zh: "zh-CN",
    ar: "ar",
    hi: "hi",
    ko: "ko",
    tr: "tr",
};

// Toggle language dropdown
languageSelector.addEventListener("click", (e) => {
    e.stopPropagation();
    languageDropdown.classList.toggle("active");
});

// Handle language selection with Google Translate
languageOptions.forEach((option) => {
    option.addEventListener("click", (e) => {
        e.stopPropagation();
        const lang = option.getAttribute("data-lang");
        const langText = option.textContent;

        // Update selected language display
        document.querySelector(".language-text").textContent = langText;
        languageDropdown.classList.remove("active");

        // Use Google Translate to translate the page
        const googleTranslateElement = document.querySelector(".goog-te-combo");
        if (googleTranslateElement) {
            googleTranslateElement.value = languageCodeMap[lang] || lang;
            googleTranslateElement.dispatchEvent(new Event("change"));
        }

        console.log("Translating to:", lang);
    });
});

// Close dropdown when clicking outside
document.addEventListener("click", () => {
    languageDropdown.classList.remove("active");
});

// ===================================
// HAMBURGER MENU FUNCTIONALITY
// ===================================
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");
const menuItems = document.querySelectorAll(".menu-item");

// Toggle mobile menu
menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    menuToggle.classList.toggle("active");
    mobileMenu.classList.toggle("active");

    // Prevent body scroll when menu is open
    if (mobileMenu.classList.contains("active")) {
        document.body.style.overflow = "hidden";
    } else {
        document.body.style.overflow = "auto";
    }
});

// Updated menu handler for both sections and pages
menuItems.forEach((item) => {
    item.addEventListener("click", () => {
        const section = item.getAttribute("data-section");
        const page = item.getAttribute("data-page");

        // Close menu
        menuToggle.classList.remove("active");
        mobileMenu.classList.remove("active");
        document.body.style.overflow = "auto";

        // Navigate to page or scroll to section
        if (page) {
            window.location.href = page;
        } else if (section) {
            const targetSection = document.getElementById(section);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        }
    });
});
// Close menu when clicking outside
document.addEventListener("click", (e) => {
    if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        menuToggle.classList.remove("active");
        mobileMenu.classList.remove("active");
        document.body.style.overflow = "auto";
    }
});

// ===================================
// HEADER SLIDER FUNCTIONALITY
// ===================================
let currentSlide = 0;
const slides = document.querySelectorAll(".header-slide");
const slideInterval = 8000; // 8 seconds per slide

function changeSlide() {
    // Remove active class from current slide
    slides[currentSlide].classList.remove("active");

    // Move to next slide
    currentSlide = (currentSlide + 1) % slides.length;

    // Add active class to new slide
    slides[currentSlide].classList.add("active");

    // Restart typing animation for the new slide
    if (currentSlide === 0) {
        setTimeout(() => {
            typeText("typingText1", "YOUR SATISFACTION IS OUR CONCERN");
        }, 500);
    } else if (currentSlide === 1) {
        setTimeout(() => {
            typeText("typingText2", "FAST AND SAFE DELIVERY WORLDWIDE");
        }, 500);
    }
}

// Auto slide every 8 seconds
setInterval(changeSlide, slideInterval);

// ===================================
// TYPING ANIMATION
// ===================================
function typeText(elementId, text) {
    const element = document.getElementById(elementId);
    if (!element) return;

    // Clear existing text
    element.textContent = "";

    // Split text into words
    const words = text.split(" ");
    let wordIndex = 0;
    let currentText = "";

    function typeWord() {
        if (wordIndex < words.length) {
            // Add space before word (except first word)
            currentText += (wordIndex > 0 ? " " : "") + words[wordIndex];
            element.textContent = currentText;
            wordIndex++;

            // Delay between words
            setTimeout(typeWord, 250);
        }
    }

    // Start typing
    typeWord();
}

// Start first typing animation after page load
window.addEventListener("load", () => {
    setTimeout(() => {
        typeText("typingText1", "YOUR SATISFACTION IS OUR CONCERN");
    }, 1500);
});

// ===================================
// SMOOTH SCROLL FUNCTION
// ===================================
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }
}

// ===================================
// RESPONSIVE OPTIMIZATION
// ===================================

// Handle window resize
let resizeTimer;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Close mobile menu on resize
        if (window.innerWidth > 768) {
            menuToggle.classList.remove("active");
            mobileMenu.classList.remove("active");
            document.body.style.overflow = "auto";
        }
    }, 250);
});

// ===================================
// PERFORMANCE OPTIMIZATION
// ===================================

// Pause animations when page is hidden
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        // Page is hidden, pause animations if needed
        console.log("Page hidden - animations paused");
    } else {
        // Page is visible again
        console.log("Page visible - animations resumed");
    }
});

// ===================================
// COUNTER ANIMATION FOR STATISTICS
// ===================================
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = Math.floor(target);
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

const observerOptions = {
    threshold: 0.5,
    rootMargin: "0px",
};

let hasAnimated = false;

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting && !hasAnimated) {
            hasAnimated = true;
            const counterElement = document.getElementById("successRate");
            if (counterElement) {
                animateCounter(counterElement, 99, 2500);
            }
        }
    });
}, observerOptions);

const statisticsSection = document.querySelector(".statistics-section");
if (statisticsSection) {
    statsObserver.observe(statisticsSection);
}

// ===================================
// BACK TO TOP BUTTON
// ===================================
const backToTopButton = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
    if (window.pageYOffset > 300) {
        backToTopButton.classList.add("visible");
    } else {
        backToTopButton.classList.remove("visible");
    }
});

backToTopButton.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
});

// ===================================
// DEBUG INFO (Remove in production)
// ===================================
console.log("TransNova Courier Website Loaded Successfully!");
console.log("Total slides:", slides.length);
console.log("Current slide:", currentSlide);
