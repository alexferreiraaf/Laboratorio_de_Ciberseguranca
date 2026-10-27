/*
 * Alternador de tema (claro/escuro) compartilhado por todo o laboratório.
 *
 * Privacidade: a única coisa guardada é a palavra "light" ou "dark" no
 * localStorage do SEU navegador (não é cookie, não é enviada a nenhum servidor).
 */
(function () {
    var STORAGE_KEY = 'lab-theme';
    var root = document.documentElement;

    function getSavedTheme() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (e) {
            return null; // navegador bloqueou o armazenamento: tudo bem
        }
    }

    function saveTheme(theme) {
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch (e) { /* ignorar */ }
    }

    // Sem escolha salva, segue a preferência do sistema operacional.
    function getInitialTheme() {
        var saved = getSavedTheme();
        if (saved === 'light' || saved === 'dark') return saved;
        var prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
        return prefersLight ? 'light' : 'dark';
    }

    // Aplica o tema imediatamente (este script roda no <head>), evitando "piscar" de cor.
    root.setAttribute('data-theme', getInitialTheme());

    function injectStyles() {
        var style = document.createElement('style');
        style.textContent =
            '#theme-toggle{position:fixed;top:14px;right:14px;z-index:1000;width:42px;height:42px;' +
            'border-radius:50%;border:1px solid var(--border-color);background:var(--panel-bg,var(--card-bg));' +
            'color:var(--text-color);font-size:20px;line-height:1;cursor:pointer;padding:0;display:flex;' +
            'align-items:center;justify-content:center;box-shadow:0 2px 8px var(--shadow);' +
            'transition:transform .2s,border-color .2s;}' +
            '#theme-toggle:hover{transform:scale(1.1);border-color:var(--accent-color);}' +
            '#theme-toggle:focus-visible{outline:2px solid var(--accent-color);outline-offset:2px;}';
        document.head.appendChild(style);
    }

    // Ícones em SVG (desenhados por código): ficam nítidos em qualquer tela e
    // aparecem iguais em todos os navegadores, diferente de emojis.
    var SUN_SVG =
        '<svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">' +
        '<defs><radialGradient id="sunCore" cx="40%" cy="35%" r="70%">' +
        '<stop offset="0%" stop-color="#fff4a8"/><stop offset="55%" stop-color="#ffc83d"/>' +
        '<stop offset="100%" stop-color="#f59e0b"/></radialGradient></defs>' +
        '<g stroke="#f5a623" stroke-width="2.4" stroke-linecap="round">' +
        '<line x1="16" y1="2.5" x2="16" y2="6"/><line x1="16" y1="26" x2="16" y2="29.5"/>' +
        '<line x1="2.5" y1="16" x2="6" y2="16"/><line x1="26" y1="16" x2="29.5" y2="16"/>' +
        '<line x1="6.4" y1="6.4" x2="8.9" y2="8.9"/><line x1="23.1" y1="23.1" x2="25.6" y2="25.6"/>' +
        '<line x1="6.4" y1="25.6" x2="8.9" y2="23.1"/><line x1="23.1" y1="8.9" x2="25.6" y2="6.4"/></g>' +
        '<circle cx="16" cy="16" r="7.5" fill="url(#sunCore)" stroke="#f59e0b" stroke-width="0.8"/></svg>';

    var MOON_SVG =
        '<svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">' +
        '<defs><linearGradient id="moonBody" x1="15%" y1="10%" x2="85%" y2="90%">' +
        '<stop offset="0%" stop-color="#fffbe6"/><stop offset="60%" stop-color="#e6dca8"/>' +
        '<stop offset="100%" stop-color="#c9b972"/></linearGradient></defs>' +
        '<path d="M26.5 19.5A11.5 11.5 0 0 1 12.5 5.5a11.5 11.5 0 1 0 14 14z" ' +
        'fill="url(#moonBody)" stroke="#b8a65a" stroke-width="0.8" stroke-linejoin="round"/>' +
        '<circle cx="12" cy="20" r="1.6" fill="#b8a65a" opacity="0.45"/>' +
        '<circle cx="17.5" cy="25" r="1.1" fill="#b8a65a" opacity="0.45"/>' +
        '<path d="M24 5l.9 2.1 2.1.9-2.1.9L24 11l-.9-2.1L21 8l2.1-.9z" fill="#ffe27a"/></svg>';

    function updateButton(btn) {
        var isDark = root.getAttribute('data-theme') === 'dark';
        // No tema escuro mostramos o sol (clique = ir para o claro) e vice-versa.
        btn.innerHTML = isDark ? SUN_SVG : MOON_SVG;
        var label = isDark ? 'Mudar para o tema claro' : 'Mudar para o tema escuro';
        btn.setAttribute('aria-label', label);
        btn.title = label;
    }

    function createButton() {
        injectStyles();
        var btn = document.createElement('button');
        btn.id = 'theme-toggle';
        btn.type = 'button';
        updateButton(btn);
        btn.addEventListener('click', function () {
            var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', next);
            saveTheme(next);
            updateButton(btn);
        });
        document.body.appendChild(btn);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createButton);
    } else {
        createButton();
    }
})();
