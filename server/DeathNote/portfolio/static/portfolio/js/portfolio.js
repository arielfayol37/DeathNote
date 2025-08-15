// Portfolio Interactive Effects
document.addEventListener('DOMContentLoaded', function() {
    
    // Tab Navigation System
    initTabNavigation();
    
    // Particle Background Effect
    createParticleBackground();
    
    // Smooth Scroll Animation
    initSmoothScroll();
    
    // Card Interaction Effects
    initCardEffects();
    
    // Typing Animation for Header
    initTypingEffect();
    
    // Parallax Scrolling
    initParallax();
    
    // Interactive Skill Tags
    initSkillInteractions();
    
    // Loading Animations
    initLoadingAnimations();
    
    // Contact Interactions
    initContactInteractions();
    
    // Blog Article Interactions
    initBlogArticleInteractions();
});

// Tab Navigation System
function initTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Function to switch to a specific tab
    function switchToTab(tabName) {
        // Remove active class from all buttons and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to target button and content
        const targetButton = document.querySelector(`[data-tab="${tabName}"]`);
        const targetContent = document.getElementById(`${tabName}-content`);
        
        if (targetButton && targetContent) {
            targetButton.classList.add('active');
            targetContent.classList.add('active');
            
            // Reset scroll position to top when switching tabs
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Add entrance animation
            targetContent.style.opacity = '0';
            targetContent.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                targetContent.style.opacity = '1';
                targetContent.style.transform = 'translateY(0)';
            }, 50);
            
            // Update URL hash without triggering scroll
            const currentHash = window.location.hash;
            const newHash = `#${tabName}`;
            if (currentHash !== newHash) {
                history.replaceState(null, null, newHash);
            }
        }
    }
    
    // Function to handle hash changes
    function handleHashChange() {
        const hash = window.location.hash.slice(1); // Remove the # symbol
        if (hash && ['portfolio', 'about', 'blog', 'contact', 'resume'].includes(hash)) {
            switchToTab(hash);
        } else {
            // Default to portfolio if no valid hash
            switchToTab('portfolio');
        }
    }
    
    // Handle initial page load
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            if (targetTab) {
                // Switch to the tab
                switchToTab(targetTab);
                
                // Add click effect
                button.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    button.style.transform = '';
                }, 150);
            }
        });
        
        // Keyboard navigation
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                button.click();
            }
        });
    });
    
    // Add smooth transitions between tabs
    tabContents.forEach(content => {
        content.addEventListener('transitionend', () => {
            if (!content.classList.contains('active')) {
                content.style.display = 'none';
            }
        });
    });
}

// Particle Background System
function createParticleBackground() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
        opacity: 0.3;
    `;
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 1;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.color = '#00d4ff';
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
    
    function initParticles() {
        particles = [];
        const particleCount = Math.min(50, Math.floor(canvas.width * canvas.height / 20000));
        
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }
    
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Draw connections between nearby particles
        particles.forEach((p1, i) => {
            particles.slice(i + 1).forEach(p2 => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    ctx.save();
                    ctx.globalAlpha = (100 - distance) / 100 * 0.1;
                    ctx.strokeStyle = '#00d4ff';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                    ctx.restore();
                }
            });
        });
        
        animationId = requestAnimationFrame(animateParticles);
    }
    
    resizeCanvas();
    initParticles();
    animateParticles();
    
    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
    });
}

// Smooth Scroll Animation
function initSmoothScroll() {
    const sections = document.querySelectorAll('section');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        sectionObserver.observe(section);
    });
}

// Enhanced Card Effects
function initCardEffects() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        let isHovered = false;
        
        // Mouse move effect for 3D tilt
        card.addEventListener('mousemove', (e) => {
            if (!isHovered) return;
            
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 15;
            const rotateY = (centerX - x) / 15;
            
            card.style.transform = `
                translateY(-8px) 
                scale(1.02) 
                rotateX(${rotateX}deg) 
                rotateY(${rotateY}deg)
            `;
        });
        
        // Mouse enter
        card.addEventListener('mouseenter', () => {
            isHovered = true;
            card.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        // Reset transform on mouse leave
        card.addEventListener('mouseleave', () => {
            isHovered = false;
            card.style.transform = 'translateY(0) scale(1) rotateX(0deg) rotateY(0deg)';
        });
        
        // Click effect and navigation
        card.addEventListener('click', () => {
            // Visual feedback
            card.style.transform = 'scale(0.98)';
            
            // Check if card has a link and navigate
            const link = card.getAttribute('data-link');
            if (link) {
                setTimeout(() => {
                    window.open(link, '_blank');
                }, 150);
            }
            
            // Reset transform
            setTimeout(() => {
                if (isHovered) {
                    card.style.transform = 'translateY(-8px) scale(1.02)';
                } else {
                    card.style.transform = 'translateY(0) scale(1)';
                }
            }, 150);
        });
        
        // Keyboard navigation
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
        
        // Add accessibility features for cards with links
        if (card.hasAttribute('data-link')) {
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            const title = card.querySelector('h3')?.textContent || 'item';
            card.setAttribute('aria-label', `Click to view ${title}`);
        }
    });
}

// Typing Animation for Header
function initTypingEffect() {
    const headerTitle = document.querySelector('header h1');
    if (!headerTitle) return;
    
    const text = headerTitle.textContent;
    headerTitle.textContent = '';
    headerTitle.style.borderRight = '2px solid #00d4ff';
    
    let i = 0;
    const typeWriter = () => {
        if (i < text.length) {
            headerTitle.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        } else {
            // Blinking cursor effect
            setInterval(() => {
                headerTitle.style.borderRight = 
                    headerTitle.style.borderRight === '2px solid #00d4ff' 
                        ? '2px solid transparent' 
                        : '2px solid #00d4ff';
            }, 500);
        }
    };
    
    // Start typing after a short delay
    setTimeout(typeWriter, 500);
}

// Parallax Scrolling Effect
function initParallax() {
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.3; // Reduced intensity
        
        // Header parallax only
        if (header) {
            header.style.transform = `translateY(${rate}px)`;
        }
    });
}

// Interactive Skill Tags
function initSkillInteractions() {
    const skills = document.querySelectorAll('.skill');
    
    skills.forEach(skill => {
        skill.addEventListener('mouseenter', () => {
            // Create ripple effect
            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(0, 212, 255, 0.3);
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            const rect = skill.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = rect.width / 2 - size / 2 + 'px';
            ripple.style.top = rect.height / 2 - size / 2 + 'px';
            
            skill.style.position = 'relative';
            skill.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Loading Animations
function initLoadingAnimations() {
    // Add loading animation to images
    const images = document.querySelectorAll('.card-img');
    
    images.forEach(img => {
        img.style.opacity = '0';
        img.style.transform = 'scale(0.8)';
        img.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        
        // Add loading state to parent card
        const card = img.closest('.card');
        if (card) {
            card.classList.add('loading');
        }
        
        img.addEventListener('load', () => {
            img.style.opacity = '1';
            img.style.transform = 'scale(1)';
            if (card) {
                card.classList.remove('loading');
            }
        });
        
        img.addEventListener('error', () => {
            // Handle image load errors
            img.style.opacity = '0.3';
            img.style.filter = 'grayscale(100%)';
            if (card) {
                card.classList.remove('loading');
            }
        });
        
        // Fallback for already loaded images
        if (img.complete) {
            img.style.opacity = '1';
            img.style.transform = 'scale(1)';
            if (card) {
                card.classList.remove('loading');
            }
        }
    });
    
    // Staggered card entrance animation
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px) scale(0.9)';
        card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
        }, index * 100);
    });
}

// Contact Interactions
function initContactInteractions() {
    // Initialize copy-to-clipboard functionality
    initCopyToClipboard();
    
    // Add contact item animations
    initContactAnimations();
    
    // Add keyboard navigation for contact items
    initContactKeyboardNav();
}

// Copy to Clipboard Functionality
function initCopyToClipboard() {
    const copyButtons = document.querySelectorAll('.copy-btn');
    
    copyButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const textToCopy = button.getAttribute('data-clipboard');
            const originalText = button.innerHTML;
            
            try {
                // Try to use the modern Clipboard API
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(textToCopy);
                    showCopySuccess(button);
                } else {
                    // Fallback for older browsers
                    fallbackCopyTextToClipboard(textToCopy, button);
                }
            } catch (err) {
                console.error('Failed to copy text: ', err);
                showCopyError(button);
            }
        });
    });
}

// Fallback copy method for older browsers
function fallbackCopyTextToClipboard(text, button) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showCopySuccess(button);
        } else {
            showCopyError(button);
        }
    } catch (err) {
        console.error('Fallback copy failed: ', err);
        showCopyError(button);
    }
    
    document.body.removeChild(textArea);
}

// Show copy success state
function showCopySuccess(button) {
    button.classList.add('copied');
    button.setAttribute('aria-label', 'Copied!');
    
    // Reset after 2 seconds
    setTimeout(() => {
        button.classList.remove('copied');
        button.setAttribute('aria-label', button.getAttribute('data-clipboard'));
    }, 2000);
}

// Show copy error state
function showCopyError(button) {
    button.style.background = 'rgba(244, 67, 54, 0.2)';
    button.style.borderColor = '#f44336';
    button.style.color = '#f44336';
    
    // Reset after 2 seconds
    setTimeout(() => {
        button.style.background = '';
        button.style.borderColor = '';
        button.style.color = '';
    }, 2000);
}

// Contact Item Animations
function initContactAnimations() {
    const contactItems = document.querySelectorAll('.contact-item');
    
    contactItems.forEach((item, index) => {
        // Staggered entrance animation
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 150);
        
        // Add ripple effect on click
        item.addEventListener('click', (e) => {
            if (e.target.closest('.contact-link') || e.target.closest('.copy-btn')) {
                return; // Don't add ripple for button clicks
            }
            
            createRippleEffect(e, item);
        });
        
        // Make entire contact item clickable for main action
        item.addEventListener('click', (e) => {
            if (e.target.closest('.contact-link') || e.target.closest('.copy-btn')) {
                return; // Don't trigger main action for button clicks
            }
            
            const actionUrl = item.getAttribute('data-action-url');
            if (actionUrl) {
                // Add click effect
                item.style.transform = 'scale(0.98)';
                
                // Perform the main action
                if (actionUrl.startsWith('mailto:') || actionUrl.startsWith('tel:')) {
                    window.location.href = actionUrl;
                } else {
                    window.open(actionUrl, '_blank');
                }
                
                // Reset transform
                setTimeout(() => {
                    item.style.transform = '';
                }, 150);
            }
        });
        
        // Add keyboard navigation for contact items
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                item.click();
            }
        });
    });
}

// Create ripple effect for contact items
function createRippleEffect(event, element) {
    const ripple = document.createElement('div');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: radial-gradient(circle, rgba(0, 212, 255, 0.3) 0%, transparent 70%);
        border-radius: 50%;
        transform: scale(0);
        animation: contactRipple 0.6s linear;
        pointer-events: none;
        z-index: 1;
    `;
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Contact Keyboard Navigation
function initContactKeyboardNav() {
    const contactItems = document.querySelectorAll('.contact-item');
    
    contactItems.forEach(item => {
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                item.click();
            }
        });
        
        // Focus management
        item.addEventListener('focus', () => {
            item.style.outline = '2px solid #00d4ff';
            item.style.outlineOffset = '2px';
        });
        
        item.addEventListener('blur', () => {
            item.style.outline = '';
            item.style.outlineOffset = '';
        });
    });
}

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .skill {
        position: relative;
        overflow: hidden;
    }
`;
document.head.appendChild(style);

// Blog Article Interactions
function initBlogArticleInteractions() {
    const articleItems = document.querySelectorAll('.article-item');
    
    articleItems.forEach(item => {
        // Handle clicks on the article item (for enhanced UX)
        item.addEventListener('click', (e) => {
            // Don't trigger if clicking on the link directly
            if (e.target.closest('.article-link')) {
                return;
            }
            
            const articleUrl = item.getAttribute('data-article-url');
            if (articleUrl) {
                // Add click effect
                item.style.transform = 'scale(0.98)';
                
                // Open article in same tab
                setTimeout(() => {
                    window.location.href = articleUrl;
                    // Reset transform
                    item.style.transform = '';
                }, 150);
            }
        });
        
        // Handle direct link clicks (for LLMs and accessibility)
        const articleLink = item.querySelector('.article-link');
        if (articleLink) {
            articleLink.addEventListener('click', (e) => {
                // Add click effect to the link
                e.target.style.transform = 'scale(0.98)';
                
                setTimeout(() => {
                    e.target.style.transform = '';
                }, 150);
            });
        }
        
        // Keyboard navigation
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                item.click();
            }
        });
        
        // Add accessibility attributes
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        const title = item.querySelector('h4')?.textContent || 'article';
        item.setAttribute('aria-label', `Click to read ${title}`);
    });
}

// Add CSS for contact ripple animation
const contactStyle = document.createElement('style');
contactStyle.textContent = `
    @keyframes contactRipple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .contact-item {
        cursor: pointer;
    }
    
    .contact-item:focus {
        outline: 2px solid #00d4ff;
        outline-offset: 2px;
    }
`;
document.head.appendChild(contactStyle);
