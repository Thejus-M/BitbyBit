/**
 * Theme Manager - Cookie Based
 * Handles dark/light mode persistence using cookies.
 */

window.ThemeManager = {
    setCookie: function(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
    },

    getCookie: function(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },

    // Apply theme to DOM
    applyTheme: function(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        // Also handle class-based systems if needed (for fallback)
        if (theme === 'dark') {
            document.documentElement.classList.add('theme-dark');
            document.documentElement.classList.remove('theme-light');
        } else {
            document.documentElement.classList.add('theme-light');
            document.documentElement.classList.remove('theme-dark');
        }
    },

    init: function() {
        const savedTheme = this.getCookie('theme');
        if (savedTheme) {
            this.applyTheme(savedTheme);
        } else {
            // Default to Dark Mode on first visit
            this.setCookie('theme', 'dark', 365);
            this.applyTheme('dark');
        }
    },

    toggle: function() {
        const current = this.getCookie('theme') || 'dark';
        const target = current === 'dark' ? 'light' : 'dark';
        
        this.setCookie('theme', target, 365);
        this.applyTheme(target);
        
        return target;
    }
};

// Run immediately on load to prevent flash
window.ThemeManager.init();
