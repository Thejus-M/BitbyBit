#!/usr/bin/env node
/**
 * cache-resource-thumbnails.js
 * 
 * Node.js script to pre-fetch and cache thumbnails for resource cards.
 * Run this script whenever you add new resources to avoid Microlink API limits.
 * 
 * Usage: node scripts/cache-resource-thumbnails.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const crypto = require('crypto');

// Configuration
const BLOGS_DIR = path.join(__dirname, '..', 'blogs');
const CACHE_DIR = path.join(__dirname, '..', 'assets', 'images', 'resource-cache');
const MANIFEST_PATH = path.join(CACHE_DIR, 'manifest.json');

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  console.log(`✓ Created cache directory: ${CACHE_DIR}`);
}

// Load existing manifest or create new one
let manifest = {};
if (fs.existsSync(MANIFEST_PATH)) {
  manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  console.log(`✓ Loaded existing manifest with ${Object.keys(manifest).length} entries`);
}

// Hash URL to create filename
function hashUrl(url) {
  return crypto.createHash('md5').update(url).digest('hex');
}

// Extract YouTube video ID
function getYouTubeId(url) {
  if (url.includes('v=')) {
    return url.split('v=')[1].split('&')[0];
  } else if (url.includes('youtu.be/')) {
    return url.split('youtu.be/')[1].split('?')[0];
  }
  return null;
}

// Download image from URL
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const request = protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(filepath);
      });
      
      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete partial file
        reject(err);
      });
    });
    
    request.on('error', reject);
    request.setTimeout(15000, () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Fetch image URL from Microlink API
function fetchMicrolinkImage(url) {
  return new Promise((resolve, reject) => {
    const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}`;
    
    https.get(apiUrl, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.status === 'success') {
            if (json.data.image && json.data.image.url) {
              resolve(json.data.image.url);
            } else if (json.data.logo && json.data.logo.url) {
              resolve(json.data.logo.url);
            } else {
              reject(new Error('No image found'));
            }
          } else {
            reject(new Error(json.message || 'API error'));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Fetch Wikipedia page thumbnail using their API
function fetchWikipediaImage(url) {
  return new Promise((resolve, reject) => {
    // Extract page title from URL
    // e.g., https://en.wikipedia.org/wiki/Claude_%28language_model%29 -> Claude_(language_model)
    const match = url.match(/wikipedia\.org\/wiki\/([^#?]+)/);
    if (!match) {
      reject(new Error('Invalid Wikipedia URL'));
      return;
    }
    
    const pageTitle = match[1];
    const lang = url.match(/\/\/([a-z]+)\.wikipedia/)?.[1] || 'en';
    
    // Use Wikipedia API to get page image
    const apiUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${pageTitle}`;
    
    const options = {
      headers: {
        'User-Agent': 'BitByBitBlog/1.0 (https://bitbybit.dev; contact@bitbybit.dev)'
      }
    };
    
    https.get(apiUrl, options, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          const json = JSON.parse(data);
          
          // Check for thumbnail
          if (json.thumbnail && json.thumbnail.source) {
            resolve(json.thumbnail.source);
          } else if (json.originalimage && json.originalimage.source) {
            resolve(json.originalimage.source);
          } else {
            // Fallback to Wikipedia logo
            resolve('https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/200px-Wikipedia-logo-v2.svg.png');
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Extract resource URLs from HTML files
function extractResourceUrls() {
  const urls = new Set();
  
  const htmlFiles = fs.readdirSync(BLOGS_DIR).filter(f => f.endsWith('.html'));
  
  htmlFiles.forEach(file => {
    const content = fs.readFileSync(path.join(BLOGS_DIR, file), 'utf8');
    
    // Match resource-card href attributes
    const regex = /<a[^>]+class="[^"]*resource-card[^"]*"[^>]+href="([^"]+)"/g;
    const regex2 = /<a[^>]+href="([^"]+)"[^>]+class="[^"]*resource-card[^"]*"/g;
    
    let match;
    while ((match = regex.exec(content)) !== null) {
      urls.add(match[1]);
    }
    while ((match = regex2.exec(content)) !== null) {
      urls.add(match[1]);
    }
  });
  
  console.log(`\n✓ Found ${urls.size} unique resource URLs across blog files\n`);
  return Array.from(urls);
}

// Process a single URL
async function processUrl(url) {
  const hash = hashUrl(url);
  
  // Check if already cached
  if (manifest[hash] && manifest[hash].cached) {
    const cachedPath = path.join(CACHE_DIR, manifest[hash].filename);
    if (fs.existsSync(cachedPath)) {
      console.log(`  ⏭️  Skipped (cached): ${url.substring(0, 60)}...`);
      return;
    }
  }
  
  try {
    let imageUrl;
    let isYouTube = false;
    let isWikipedia = false;
    
    // Check for YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = getYouTubeId(url);
      if (videoId) {
        imageUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        isYouTube = true;
      }
    }
    
    // Check for Wikipedia (use their API directly)
    if (!imageUrl && url.includes('wikipedia.org')) {
      console.log(`  📚 Fetching from Wikipedia API: ${url.substring(0, 50)}...`);
      imageUrl = await fetchWikipediaImage(url);
      isWikipedia = true;
    }
    
    // Fallback to Microlink for everything else
    if (!imageUrl) {
      console.log(`  🔍 Fetching from Microlink: ${url.substring(0, 50)}...`);
      imageUrl = await fetchMicrolinkImage(url);
    }
    
    // Determine file extension
    const ext = imageUrl.match(/\.(jpg|jpeg|png|gif|webp)/i)?.[1] || 'jpg';
    const filename = `${hash}.${ext}`;
    const filepath = path.join(CACHE_DIR, filename);
    
    // Download image
    await downloadImage(imageUrl, filepath);
    
    // Update manifest
    manifest[hash] = {
      url: url,
      filename: filename,
      imageUrl: imageUrl,
      isYouTube: isYouTube,
      cached: true,
      cachedAt: new Date().toISOString()
    };
    
    console.log(`  ✅ Cached: ${filename} (${isYouTube ? 'YouTube' : 'Microlink'})`);
    
  } catch (error) {
    console.log(`  ❌ Failed: ${url.substring(0, 50)}... - ${error.message}`);
    manifest[hash] = {
      url: url,
      cached: false,
      error: error.message,
      attemptedAt: new Date().toISOString()
    };
  }
}

// Main execution
async function main() {
  console.log('='.repeat(60));
  console.log('Resource Thumbnail Cache Builder');
  console.log('='.repeat(60));
  
  const urls = extractResourceUrls();
  
  for (const url of urls) {
    await processUrl(url);
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 500));
  }
  
  // Save JSON manifest (for reference)
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  
  // Generate JS file with relative paths for browser use
  const jsData = {};
  for (const [hash, entry] of Object.entries(manifest)) {
    if (entry.cached && entry.filename) {
      jsData[hash] = {
        url: entry.url,
        filename: entry.filename,
        path: `assets/images/resource-cache/${entry.filename}`,
        isYouTube: entry.isYouTube || false,
        cached: true
      };
    }
  }
  
  const jsContent = `/**
 * Resource Cache Data
 * Auto-generated by: node scripts/cache-resource-thumbnails.js
 * Generated at: ${new Date().toISOString()}
 * 
 * This file contains the cached thumbnail manifest as a global variable
 * to avoid CORS issues when loading from file:// protocol.
 */

const RESOURCE_CACHE = ${JSON.stringify(jsData, null, 2)};
`;
  
  const jsPath = path.join(__dirname, '..', 'assets', 'js', 'resource-cache-data.js');
  fs.writeFileSync(jsPath, jsContent);
  
  console.log('\n' + '='.repeat(60));
  console.log(`✓ JSON manifest saved to: ${MANIFEST_PATH}`);
  console.log(`✓ JS cache data saved to: ${jsPath}`);
  console.log(`✓ Total cached: ${Object.values(manifest).filter(m => m.cached).length}/${urls.length}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
