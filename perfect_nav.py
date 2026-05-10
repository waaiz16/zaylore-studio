import os
import re

navbar_html = """
    <!-- Navigation -->
    <nav id="main-nav">
        <div class="nav-container">
            <a href="index.html" class="nav-logo">
                <img src="img/logo-icon-sm.jpg" alt="Zaylore Logo">
                <span class="logo-text">ZAYLORE</span>
            </a>
            
            <div class="nav-center" id="nav-center">
                <div class="nav-links">
                    <a href="index.html" class="nav-link">Home</a>
                    <a href="products.html" class="nav-link">Products</a>
                    <a href="creators.html" class="nav-link">Creators</a>
                    <a href="events.html" class="nav-link">Events</a>
                    <a href="about.html" class="nav-link">About</a>
                    <a href="contact.html" class="nav-link">Contact</a>
                </div>
            </div>

            <div class="nav-right">
                <a href="account.html" class="nav-icon-link" aria-label="Account">
                    <div class="nav-icon-circle">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                </a>
                <div class="hamburger" id="hamburger">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    </nav>
"""

navbar_js = """
        // Unified Navbar Logic
        (function () {
            const nav = document.getElementById('main-nav');
            const hamburger = document.getElementById('hamburger');
            const navCenter = document.getElementById('nav-center');
            
            if (nav) {
                window.addEventListener('scroll', () => {
                    if (window.scrollY > 50) {
                        nav.classList.add('scrolled');
                    } else {
                        nav.classList.remove('scrolled');
                    }
                }, { passive: true });
            }

            if (hamburger && navCenter) {
                hamburger.addEventListener('click', () => {
                    hamburger.classList.toggle('active');
                    navCenter.classList.toggle('open');
                });
                
                navCenter.querySelectorAll('.nav-link').forEach(link => {
                    link.addEventListener('click', () => {
                        hamburger.classList.remove('active');
                        navCenter.classList.remove('open');
                    });
                });
            }
        })();
"""

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

for filename in html_files:
    if filename in ['seo-checklist.html', 'seo-verification.html']: continue
    
    with open(filename, 'r') as f:
        content = f.read()
    
    # 1. Update active state
    current_nav = navbar_html
    if filename == 'index.html':
        current_nav = current_nav.replace('href="index.html" class="nav-link"', 'href="index.html" class="nav-link active"')
    elif filename == 'products.html':
        current_nav = current_nav.replace('href="products.html" class="nav-link"', 'href="products.html" class="nav-link active"')
    elif filename == 'about.html':
        current_nav = current_nav.replace('href="about.html" class="nav-link"', 'href="about.html" class="nav-link active"')
    elif filename == 'contact.html':
        current_nav = current_nav.replace('href="contact.html" class="nav-link"', 'href="contact.html" class="nav-link active"')
    elif filename == 'creators.html':
        current_nav = current_nav.replace('href="creators.html" class="nav-link"', 'href="creators.html" class="nav-link active"')
    elif filename == 'events.html':
        current_nav = current_nav.replace('href="events.html" class="nav-link"', 'href="events.html" class="nav-link active"')

    # 2. Replace existing nav
    content = re.sub(r'<!-- Navigation -->\s*<nav.*?>.*?</nav>', current_nav, content, flags=re.DOTALL)
    content = re.sub(r'<nav id="main-nav".*?>.*?</nav>', current_nav, content, flags=re.DOTALL)
    content = re.sub(r'<nav.*?>.*?</nav>', current_nav, content, flags=re.DOTALL, count=1)
    
    # 3. Clean up specific nav styles if they exist
    content = re.sub(r'#main-nav\s*\{.*?\}', '', content, flags=re.DOTALL)
    content = re.sub(r'\.nav-container\s*\{.*?\}', '', content, flags=re.DOTALL)
    
    # 4. Insert/Update JS
    if navbar_js not in content:
        # Try to replace old hamburger/scroll handlers
        content = re.sub(r'// Hamburger menu toggle.*?\}\)\(\);', navbar_js, content, flags=re.DOTALL)
        content = re.sub(r'// Unified scroll handler.*?\}\)\(\);', '', content, flags=re.DOTALL)
        
        if navbar_js not in content:
            # Fallback: append before </body>
            content = content.replace('</body>', f'    <script>{navbar_js}</script>\n</body>')

    with open(filename, 'w') as f:
        f.write(content)
    print(f"Perfected {filename}")

os.remove('update_footers.py') # Cleanup old script
