/**
 * Image normalization utility to convert common, direct, and indirect
 * webpage links (Unsplash, Google Drive, Dropbox, Imgur, PostImages, ImgBB) to raw image stream URLs.
 */
export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  let cleanUrl = url.trim();

  // If it's a data URL (base64 encoded image), bypass all normalization checks immediately
  if (cleanUrl.toLowerCase().startsWith("data:")) {
    return cleanUrl;
  }

  // Strip common parsing garbage if they accidentally pasted Markdown or HTML snippets, brackets, or quotes
  cleanUrl = cleanUrl.replace(/^["'(`\s!\[\]]+|["')`\s!\[\]]+$/g, "");
  
  // If it's a markdown link like ![name](url), extract URL
  const mdMatch = cleanUrl.match(/!\[.*?\]\((.*?)\)/);
  if (mdMatch && mdMatch[1]) {
    cleanUrl = mdMatch[1].trim();
  }
  
  // If it's an HTML tag with src like <img src="url" .../>
  const htmlMatch = cleanUrl.match(/src=["'](.*?)["']/);
  if (htmlMatch && htmlMatch[1]) {
    cleanUrl = htmlMatch[1].trim();
  }

  // Convert http:// to https:// to prevent Mixed Content security block in browser
  if (cleanUrl.toLowerCase().startsWith("http://")) {
    cleanUrl = "https://" + cleanUrl.substring(7);
  }

  // 1. Google Drive link converter
  if (cleanUrl.includes("drive.google.com")) {
    const fileIdMatch = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
    }
  }

  // 2. Dropbox link converter
  if (cleanUrl.includes("dropbox.com")) {
    if (cleanUrl.includes("dl=0") || cleanUrl.includes("dl=1")) {
      return cleanUrl.replace(/dl=[01]/, "raw=1");
    } else if (!cleanUrl.includes("?")) {
      return `${cleanUrl}?raw=1`;
    } else {
      return `${cleanUrl}&raw=1`;
    }
  }

  // 3. Imgur link converter
  if (cleanUrl.includes("imgur.com") && !cleanUrl.includes("i.imgur.com")) {
    if (!cleanUrl.includes("/a/") && !cleanUrl.includes("/gallery/")) {
      const match = cleanUrl.match(/imgur\.com\/([a-zA-Z0-9]+)/);
      if (match && match[1]) {
        return `https://i.imgur.com/${match[1]}.jpg`;
      }
    }
  }

  // 4. Postimages.org/postimg.cc link converter
  // From: https://postimg.cc/xyz123abc
  // To: https://i.postimg.cc/xyz123abc/image.png
  if (cleanUrl.includes("postimg.cc") && !cleanUrl.includes("i.postimg.cc")) {
    const parts = cleanUrl.split("?")[0].split("/");
    const code = parts[parts.length - 1];
    if (code && code.length >= 4) {
      return `https://i.postimg.cc/${code}/image.png`;
    }
  }

  // 5. ImgBB link converter
  // From: https://ibb.co/xyz123abc
  // To: https://i.ibb.co/xyz123abc/image.png
  if (cleanUrl.includes("ibb.co") && !cleanUrl.includes("i.ibb.co")) {
    const parts = cleanUrl.split("?")[0].split("/");
    const code = parts[parts.length - 1];
    if (code && code.length >= 4) {
      return `https://i.ibb.co/${code}/image.png`;
    }
  }

  // 6. Unsplash image parameter appender to optimize loading and prevent standard CORS/size blocks
  if (cleanUrl.includes("images.unsplash.com") && !cleanUrl.includes("?")) {
    return `${cleanUrl}?auto=format&fit=crop&w=1200&q=80`;
  }

  // 7. Unsplash page converter
  if (cleanUrl.includes("unsplash.com") && !cleanUrl.includes("images.unsplash.com")) {
    // e.g. https://unsplash.com/photos/a-computer-screen-a83bd57fbe
    const cleanPath = cleanUrl.split("?")[0];
    const parts = cleanPath.split("/");
    const lastPart = parts[parts.length - 1];
    if (lastPart && lastPart.length > 5) {
      const idMatch = lastPart.match(/-([a-zA-Z0-9]+)$/) || [null, lastPart];
      const photoId = idMatch[1] || lastPart;
      return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=1200&q=80`;
    }
  }

  return cleanUrl;
}

/**
 * Robustly parses multiple screenshot URLs from a multiline text string.
 * Handles cases where a base64 encoded image string (starting with data:) 
 * was folded or wrapped onto multiple lines during user copy-paste or text edits.
 */
export function parseScreenshotLines(text: string | null | undefined): string[] {
  if (!text) return [];
  const lines = text.split("\n").map(s => s.trim()).filter(s => s.length > 0);
  const result: string[] = [];
  
  let currentBase64 = "";
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    const isNewUrl = 
      lowerLine.startsWith("data:") || 
      lowerLine.startsWith("http://") || 
      lowerLine.startsWith("https://") || 
      lowerLine.startsWith("blob:");

    if (isNewUrl) {
      // If we were building a previous base64 string, commit it first
      if (currentBase64) {
        result.push(currentBase64);
        currentBase64 = "";
      }
      
      if (lowerLine.startsWith("data:")) {
        currentBase64 = line;
      } else {
        result.push(line);
      }
    } else {
      // It's a non-url line. If we are currently building a base64 string, aggregate it.
      if (currentBase64) {
        currentBase64 += line;
      } else {
        // Otherwise, it might be a malformed direct URL or comment, save it as is
        result.push(line);
      }
    }
  }
  
  // Clean up remaining open buffers
  if (currentBase64) {
    result.push(currentBase64);
  }
  
  return result;
}

