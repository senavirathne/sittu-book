/**
 * Create a default Trusted Types policy before other scripts run.
 * This supports pages using: Content-Security-Policy: require-trusted-types-for 'script'
 */
setupTrustedTypesPolicy();

document.addEventListener('DOMContentLoaded', initCatalog);

const IMAGE_PATH = 'images';
const FALLBACK_ITEM_IMAGE = 'https://via.placeholder.com/150?text=No+Image';
const FALLBACK_FREE_IMAGE = 'https://via.placeholder.com/100?text=No+Image';

async function initCatalog() {
    try {
        const data = await loadCatalogData();
        renderCatalog(data);
    } catch (error) {
        console.error('Error loading catalog data:', error);
    }
}

function setupTrustedTypesPolicy() {
    if (!window.trustedTypes) return;

    try {
        window.trustedTypes.createPolicy('default', {
            createHTML: input => input,
            createScript: input => input,
            createScriptURL: input => input
        });
    } catch (error) {
        // The policy may already exist, or CSP may not allow the "default" policy.
        console.warn('Trusted Types default policy was not created:', error);
    }
}

async function loadCatalogData() {
    const response = await fetch('data.json');

    if (!response.ok) {
        throw new Error(`Failed to load data.json: ${response.status}`);
    }

    return response.json();
}

function renderCatalog(rows) {
    const container = document.getElementById('catalog-container');

    if (!container) {
        console.error('Catalog container not found.');
        return;
    }

    container.replaceChildren();

    if (!Array.isArray(rows)) {
        console.error('Catalog data must be an array.');
        return;
    }

    const page = createElement('div', 'page');
    rows.forEach(row => page.appendChild(createCategoryRow(row)));

    container.appendChild(page);
}

function createCategoryRow(row = {}) {
    const rowElement = createElement('div', 'category-row');

    rowElement.appendChild(createPriceBanner(row));

    if (row.free_item) {
        rowElement.appendChild(createFreeItem(row.free_item));
    }

    rowElement.appendChild(createItemsContainer(row.items));

    return rowElement;
}

function createPriceBanner(row = {}) {
    const pageBadge = createElement('div', 'page-badge');
    pageBadge.appendChild(createElement('span', '', row.page ?? ''));
    pageBadge.append('පිටුව');

    const priceBox = createElement(
        'div',
        'price-text-box',
        `${row.installment ?? ''} = ${row.total ?? ''}/-`
    );

    priceBox.appendChild(createElement('div', 'blue-triangle'));

    return appendChildren(
        createElement('div', 'price-banner-container'),
        pageBadge,
        priceBox
    );
}

function createFreeItem(item = {}) {
    return appendChildren(
        createElement('div', 'free-item-container'),
        createElement('div', 'free-badge', 'FREE'),
        createImage({
            src: `${IMAGE_PATH}/${item.image ?? ''}`,
            alt: item.name ?? 'Free item',
            className: 'free-item-img',
            fallbackSrc: FALLBACK_FREE_IMAGE
        }),
        createElement('div', 'free-item-name', item.name ?? '')
    );
}

function createItemsContainer(items) {
    const container = createElement('div', 'items-flex-container');

    if (!Array.isArray(items)) return container;

    items.forEach(item => container.appendChild(createItemCard(item)));
    return container;
}

function createItemCard(item = {}) {
    const name = createElement('div', 'item-name');
    appendTextWithLineBreaks(name, item.name ?? '');

    return appendChildren(
        createElement('div', 'item-card'),
        createElement('div', 'item-id', item.id ?? ''),
        createImage({
            src: `${IMAGE_PATH}/${item.id ?? ''}.png`,
            alt: `Item ${item.id ?? ''}`,
            className: 'item-image',
            fallbackSrc: FALLBACK_ITEM_IMAGE
        }),
        name
    );
}

function createImage({ src, alt, className, fallbackSrc }) {
    const image = createElement('img', className);

    image.src = src;
    image.alt = alt;
    image.onerror = () => {
        image.onerror = null;
        image.src = fallbackSrc;
    };

    return image;
}

function appendTextWithLineBreaks(element, text) {
    String(text)
        .split('\n')
        .forEach((line, index) => {
            if (index > 0) {
                element.appendChild(document.createElement('br'));
            }

            element.appendChild(document.createTextNode(line));
        });
}

function createElement(tagName, className = '', text = null) {
    const element = document.createElement(tagName);

    if (className) element.className = className;
    if (text !== null) element.textContent = text;

    return element;
}

function appendChildren(parent, ...children) {
    parent.append(...children);
    return parent;
}