// Project 1 - Portfolio Website Script
document.addEventListener('DOMContentLoaded', function() {
    console.log('Portfolio Project page loaded');
    
    // Add syntax highlighting for code blocks
    highlightCode();
    
    // Add smooth scrolling for anchor links
    setupSmoothScrolling();
    
    // Add copy code functionality
    setupCopyCodeButtons();
    
    // Add animation to feature cards on scroll
    setupScrollAnimations();
});

function highlightCode() {
    // Simple syntax highlighting for demo
    const codeBlocks = document.querySelectorAll('code');
    codeBlocks.forEach(block => {
        const html = block.innerHTML
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&');
        
        // Add basic syntax highlighting
        let highlighted = html
            .replace(/&lt;!--.*?--&gt;/g, '<span class="comment">$&</span>')
            .replace(/&lt;\/?[\w-]+/g, '<span class="tag">$&</span>')
            .replace(/"[^"]*"/g, '<span class="string">$&</span>')
            .replace(/'[^']*'/g, '<span class="string">$&</span>')
            .replace(/\b(function|const|let|var|if|else|for|while|return|new|class|extends)\b/g, 
                '<span class="keyword">$&</span>')
            .replace(/\b(console\.log|document\.querySelector|addEventListener|getElementById)\b/g,
                '<span class="function">$&</span>');
        
        block.innerHTML = highlighted;
    });
}

function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function setupCopyCodeButtons() {
    // Add copy buttons to code blocks
    const codeContainers = document.querySelectorAll('.code-container');
    codeContainers.forEach(container => {
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-code-btn';
        copyButton.innerHTML = '<i class="far fa-copy"></i> Copy';
        copyButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: #2563eb;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: background 0.3s ease;
        `;
        
        copyButton.addEventListener('mouseenter', () => {
            copyButton.style.background = '#1d4ed8';
        });
        
        copyButton.addEventListener('mouseleave', () => {
            copyButton.style.background = '#2563eb';
        });
        
        copyButton.addEventListener('click', () => {
            const code = container.querySelector('code').textContent;
            navigator.clipboard.writeText(code)
                .then(() => {
                    const originalText = copyButton.innerHTML;
                    copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    copyButton.style.background = '#10b981';
                    
                    setTimeout(() => {
                        copyButton.innerHTML = originalText;
                        copyButton.style.background = '#2563eb';
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy code: ', err);
                    copyButton.innerHTML = '<i class="fas fa-times"></i> Failed';
                    copyButton.style.background = '#ef4444';
                    
                    setTimeout(() => {
                        copyButton.innerHTML = '<i class="far fa-copy"></i> Copy';
                        copyButton.style.background = '#2563eb';
                    }, 2000);
                });
        });
        
        container.style.position = 'relative';
        container.appendChild(copyButton);
    });
}

function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe feature cards and code examples
    document.querySelectorAll('.feature-card, .code-example, .link-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        observer.observe(el);
        
        el.classList.add('animate-in');
    });
    
    // Add CSS for animation
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
}

// Project statistics
const projectStats = {
    linesOfCode: 1500,
    developmentHours: 40,
    commits: 25,
    technologies: 6,
    
    displayStats() {
        console.log(`
        📊 Portfolio Project Statistics:
        ------------------------------
        Lines of Code: ${this.linesOfCode}
        Development Hours: ${this.developmentHours}
        Git Commits: ${this.commits}
        Technologies Used: ${this.technologies}
        ------------------------------
        `);
    }
};

// Display stats on page load
window.addEventListener('load', () => {
    projectStats.displayStats();
    
    // Show welcome message
    setTimeout(() => {
        console.log('🌟 Welcome to the Portfolio Project Details Page!');
        console.log('🔍 Explore the code examples and features implemented in this project.');
    }, 1000);
});