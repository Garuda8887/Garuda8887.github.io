// Update local time
function updateTime() {
    const el = document.getElementById('local-time');
    if (!el) return;
    const now = new Date();
    el.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
}
updateTime();
setInterval(updateTime, 60000);

// Scroll Animations (Intersection Observer)
document.addEventListener("DOMContentLoaded", function() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    // Decrypt-on-reveal text
    const heroTagline = document.querySelector('.tagline.decrypt');
    if (heroTagline) {
        setTimeout(() => decryptText(heroTagline), 300);
    }

    const decryptObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                decryptText(entry.target);
                decryptObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('h2.decrypt').forEach(el => decryptObserver.observe(el));
});

function decryptText(el) {
    if (el.dataset.decrypted) return;
    el.dataset.decrypted = 'true';

    const text = el.textContent;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    el.setAttribute('aria-label', text);
    el.textContent = '';

    const wrapper = document.createElement('span');
    wrapper.setAttribute('aria-hidden', 'true');
    el.appendChild(wrapper);

    const charset = '0123456789abcdef#$%&';
    const chars = text.split('');
    const spans = chars.map(ch => {
        const span = document.createElement('span');
        span.className = 'decrypt-char';
        if (ch.trim() === '') {
            span.textContent = ch;
        } else {
            span.textContent = charset[Math.floor(Math.random() * charset.length)];
            span.classList.add('scrambling');
        }
        wrapper.appendChild(span);
        return span;
    });

    const targetIndices = [];
    spans.forEach((span, i) => {
        if (span.classList.contains('scrambling')) targetIndices.push(i);
    });
    for (let i = targetIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [targetIndices[i], targetIndices[j]] = [targetIndices[j], targetIndices[i]];
    }

    const totalDuration = Math.min(200 + targetIndices.length * 12, 500);
    const stepDelay = targetIndices.length ? totalDuration / targetIndices.length : 0;

    const flicker = setInterval(() => {
        spans.forEach(span => {
            if (span.classList.contains('scrambling')) {
                span.textContent = charset[Math.floor(Math.random() * charset.length)];
            }
        });
    }, 40);

    targetIndices.forEach((idx, order) => {
        setTimeout(() => {
            spans[idx].textContent = chars[idx];
            spans[idx].classList.remove('scrambling');
        }, order * stepDelay);
    });

    setTimeout(() => clearInterval(flicker), totalDuration + 50);
}

// Command palette (Cmd/Ctrl+K)
document.addEventListener("DOMContentLoaded", function() {
    const dialog = document.getElementById('cmdk');
    const input = document.getElementById('cmdk-input');
    const list = document.getElementById('cmdk-list');
    const hint = document.getElementById('cmdk-hint');
    if (!dialog || !input || !list) return;

    function buildItems() {
        const items = [];

        document.querySelectorAll('section[id] > .section-header > h2').forEach(h2 => {
            items.push({
                label: h2.getAttribute('aria-label') || h2.textContent,
                sub: 'section',
                action: () => h2.closest('section').scrollIntoView({ behavior: 'smooth', block: 'start' })
            });
        });

        document.querySelectorAll('.case-study[id]').forEach(cs => {
            const title = cs.querySelector('.case-study-title');
            if (!title) return;
            items.push({
                label: title.textContent,
                sub: 'case study →',
                action: () => cs.scrollIntoView({ behavior: 'smooth', block: 'start' })
            });
        });

        document.querySelectorAll('.project-card').forEach(card => {
            const title = card.querySelector('.project-title');
            if (!title) return;
            items.push({
                label: title.textContent,
                sub: 'project ↗',
                action: () => window.open(card.href, '_blank', 'noopener,noreferrer')
            });
        });

        document.querySelectorAll('.contact-link').forEach(link => {
            const label = link.querySelector('.contact-label');
            if (!label) return;
            items.push({
                label: label.textContent,
                sub: 'link ↗',
                action: () => window.open(link.href, '_blank', 'noopener,noreferrer')
            });
        });

        return items;
    }

    const allItems = buildItems();
    let filtered = allItems;
    let activeIndex = 0;

    function render() {
        list.innerHTML = '';
        if (filtered.length === 0) {
            const li = document.createElement('li');
            li.className = 'cmdk-empty';
            li.textContent = 'No matches';
            list.appendChild(li);
            return;
        }
        filtered.forEach((item, i) => {
            const li = document.createElement('li');
            li.className = i === activeIndex ? 'active' : '';
            const label = document.createElement('span');
            label.textContent = item.label;
            const sub = document.createElement('span');
            sub.className = 'cmdk-item-sub';
            sub.textContent = item.sub;
            li.appendChild(label);
            li.appendChild(sub);
            li.addEventListener('click', () => selectItem(i));
            list.appendChild(li);
        });
    }

    function selectItem(i) {
        const item = filtered[i];
        if (!item) return;
        dialog.close();
        item.action();
    }

    function openPalette() {
        filtered = allItems;
        activeIndex = 0;
        input.value = '';
        render();
        dialog.showModal();
        input.focus();
    }

    input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        filtered = q ? allItems.filter(item => item.label.toLowerCase().includes(q)) : allItems;
        activeIndex = 0;
        render();
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIndex = Math.min(activeIndex + 1, filtered.length - 1);
            render();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIndex = Math.max(activeIndex - 1, 0);
            render();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            selectItem(activeIndex);
        }
    });

    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.close();
    });

    if (hint) hint.addEventListener('click', openPalette);

    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (dialog.open) {
                dialog.close();
            } else {
                openPalette();
            }
        }
    });
});
