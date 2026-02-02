import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

/**
 * Media Service
 * Handles camera and file system operations
 */

class MediaService {
  /**
   * Take a photo using device camera
   * @param {object} options - Camera options
   * @returns {Promise<string>} Base64 image data or file URI
   */
  async takePhoto(options = {}) {
    if (!Capacitor.isNativePlatform()) {
      // Web fallback: use file input
      return this.takePhotoWeb(options);
    }

    try {
      const image = await Camera.getPhoto({
        quality: options.quality || 90,
        allowEditing: options.allowEditing || false,
        resultType: options.resultType || CameraResultType.Base64,
        source: options.source || CameraSource.Camera,
        width: options.width,
        height: options.height,
        correctOrientation: true
      });

      if (options.resultType === CameraResultType.Uri) {
        return image.webPath;
      }

      return `data:image/${image.format};base64,${image.base64Data}`;
    } catch (error) {
      console.error('Error taking photo:', error);
      throw error;
    }
  }

  /**
   * Pick a photo from gallery
   * @param {object} options - Options
   * @returns {Promise<string>} Base64 image data or file URI
   */
  async pickPhoto(options = {}) {
    if (!Capacitor.isNativePlatform()) {
      return this.pickPhotoWeb(options);
    }

    try {
      const image = await Camera.getPhoto({
        quality: options.quality || 90,
        allowEditing: options.allowEditing || false,
        resultType: options.resultType || CameraResultType.Base64,
        source: CameraSource.Photos,
        width: options.width,
        height: options.height
      });

      if (options.resultType === CameraResultType.Uri) {
        return image.webPath;
      }

      return `data:image/${image.format};base64,${image.base64Data}`;
    } catch (error) {
      console.error('Error picking photo:', error);
      throw error;
    }
  }

  /**
   * Web fallback for taking photo
   */
  takePhotoWeb(options = {}) {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // Use rear camera on mobile

      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      };

      input.click();
    });
  }

  /**
   * Web fallback for picking photo
   */
  pickPhotoWeb(options = {}) {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      };

      input.click();
    });
  }

  /**
   * Save file to device
   * @param {string} data - File data (base64 or text)
   * @param {string} filename - Filename
   * @param {string} directory - Directory (default: Documents)
   * @returns {Promise<string>} File URI
   */
  async saveFile(data, filename, directory = Directory.Documents) {
    if (!Capacitor.isNativePlatform()) {
      // Web fallback: download file
      this.downloadFileWeb(data, filename);
      return Promise.resolve(`web://download/${filename}`);
    }

    try {
      const result = await Filesystem.writeFile({
        path: filename,
        data: data,
        directory: directory
      });

      return result.uri;
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  }

  /**
   * Read file from device
   * @param {string} path - File path
   * @param {string} directory - Directory
   * @returns {Promise<string>} File data
   */
  async readFile(path, directory = Directory.Documents) {
    if (!Capacitor.isNativePlatform()) {
      throw new Error('File reading not supported on web');
    }

    try {
      const result = await Filesystem.readFile({
        path: path,
        directory: directory
      });

      return result.data;
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  }

  /**
   * Delete file from device
   * @param {string} path - File path
   * @param {string} directory - Directory
   */
  async deleteFile(path, directory = Directory.Documents) {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      await Filesystem.deleteFile({
        path: path,
        directory: directory
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Web fallback: download file
   */
  downloadFileWeb(data, filename) {
    const blob = data.startsWith('data:') 
      ? this.dataURLtoBlob(data)
      : new Blob([data], { type: 'application/octet-stream' });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Convert data URL to Blob
   */
  dataURLtoBlob(dataURL) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  /**
   * Check if camera is available
   */
  async isCameraAvailable() {
    if (!Capacitor.isNativePlatform()) {
      return true; // Web cameras are generally available
    }

    try {
      // Try to check camera availability
      // Note: Capacitor Camera plugin doesn't have a direct availability check
      // This is a best-effort check
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const mediaService = new MediaService();
