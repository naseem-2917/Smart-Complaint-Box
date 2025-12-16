/**
 * Image Compression Utility
 * 
 * Uses the native HTML5 Canvas API to resize and compress images
 * for efficient storage as Base64 strings in Firestore.
 */

interface CompressOptions {
    /** Maximum width in pixels (default: 800) */
    maxWidth?: number;
    /** JPEG quality from 0 to 1 (default: 0.5) */
    quality?: number;
}

/**
 * Compresses an image file using the Canvas API.
 * 
 * - Resizes image to a maximum width while maintaining aspect ratio
 * - Converts to JPEG format with specified quality
 * - Returns a Base64 encoded string
 * 
 * @param file - The image File object to compress
 * @param options - Optional compression settings
 * @returns A Promise that resolves to a Base64 string (data URL)
 * 
 * @example
 * ```typescript
 * const file = inputRef.current?.files?.[0];
 * if (file) {
 *     const base64String = await compressImage(file);
 *     // Save base64String to Firestore
 * }
 * ```
 */
export const compressImage = (
    file: File,
    options: CompressOptions = {}
): Promise<string> => {
    const { maxWidth = 800, quality = 0.5 } = options;

    return new Promise((resolve, reject) => {
        // Validate input
        if (!file.type.startsWith('image/')) {
            reject(new Error('File is not an image'));
            return;
        }

        const reader = new FileReader();

        reader.onload = (event) => {
            const img = new Image();

            img.onload = () => {
                // Calculate new dimensions (maintain aspect ratio)
                let { width, height } = img;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                // Create canvas and draw resized image
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                // Use high-quality image rendering
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                // Draw the image onto the canvas
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to JPEG Base64 string
                const base64String = canvas.toDataURL('image/jpeg', quality);

                resolve(base64String);
            };

            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };

            // Load image from FileReader result
            img.src = event.target?.result as string;
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };

        // Read file as Data URL
        reader.readAsDataURL(file);
    });
};

export default compressImage;
