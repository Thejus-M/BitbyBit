/**
 * resource-preview.js
 * 
 * Displays cached thumbnails for resource cards.
 * Requires resource-cache-data.js to be loaded first (defines RESOURCE_CACHE global).
 * No external API calls - purely local cache based.
 */

document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.resource-card');
  
  // Check if cache data is available
  if (typeof RESOURCE_CACHE === 'undefined') {
    console.log('📦 RESOURCE_CACHE not found - thumbnails disabled');
    return;
  }
  
  console.log('📦 Resource cache loaded:', Object.keys(RESOURCE_CACHE).length, 'entries');

  for (const card of cards) {
    const url = card.getAttribute('href');
    if (!url) continue;

    // Find matching entry in cache by URL
    let cachedEntry = null;
    for (const [hash, entry] of Object.entries(RESOURCE_CACHE)) {
      if (entry.url === url && entry.cached === true && entry.path) {
        cachedEntry = entry;
        break;
      }
    }
    
    // Skip if not cached
    if (!cachedEntry) {
      console.log('⏭️ No cache for:', url.substring(0, 50) + '...');
      continue;
    }

    // Create container
    const thumbContainer = document.createElement('div');
    thumbContainer.className = 'resource-thumb-container';
    card.insertBefore(thumbContainer, card.firstChild);
    
    // Create image using relative path
    const img = document.createElement('img');
    img.className = 'resource-thumb';
    
    // Add invert class if flagged (for images with too much blue)
    if (cachedEntry.invert) {
      img.classList.add('invert');
    }
    
    img.alt = 'Resource Thumbnail';
    img.loading = 'lazy';
    
    img.onload = () => {
      img.style.opacity = '1';
      card.classList.add('has-thumbnail');
    };
    
    img.onerror = () => {
      console.warn('Failed to load cached image:', cachedEntry.path);
      thumbContainer.remove();
      card.classList.remove('has-thumbnail');
    };
    
    // Use relative path from root (prepend ../ for blogs folder)
    img.src = '../' + cachedEntry.path;
    thumbContainer.appendChild(img);
    
    // Add YouTube indicator if applicable
    if (cachedEntry.isYouTube) {
      const indicator = document.createElement('div');
      indicator.className = 'youtube-indicator';
      indicator.innerHTML = '<svg class="youtube-icon" viewBox="0 0 24 24"><path d="M10 15l5.19-3L10 9v6zm11.56-7.83c.13.47.22 1.1.28 1.9.07 1.25.07 3.3.07 3.3s0 2.05-.07 3.3c-.06.8-.15 1.43-.28 1.9-.3.94-1.07 1.6-2.02 1.9-1.5.37-7.54.4-7.54.4s-6.04-.03-7.54-.4c-.95-.3-1.72-.96-2.02-1.9-.13-.47-.22-1.1-.28-1.9-.07-1.25-.07-3.3-.07-3.3s0-2.05.07-3.3c.06-.8.15-1.43.28-1.9.3-.94 1.07-1.6 2.02-1.9C6.46 6.03 12 6 12 6s5.54.03 7.04.4c.95.3 1.72.96 2.02 1.9z"/></svg>';
      thumbContainer.appendChild(indicator);
    }
    
    console.log('✅ Loaded:', cachedEntry.filename);
  }
});
