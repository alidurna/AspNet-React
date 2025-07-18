import React from 'react';
import { FaFileAlt, FaFileArchive, FaFileAudio, FaFileCode, FaFileExcel, FaFileImage, FaFilePdf, FaFilePowerpoint, FaFileVideo, FaFileWord } from 'react-icons/fa';

/**
 * @function getFileIcon
 * @description Dosya uzantısına göre ilgili React ikonunu döndürür.
 * Tanımlanmayan dosya tipleri için varsayılan bir ikon sunar.
 *
 * @param {string} fileName - İkonu alınacak dosyanın adı (uzantısı dahil).
 * @returns {JSX.Element} Dosya tipine uygun React ikon bileşeni.
 *
 * @example
 * getFileIcon("document.pdf") // Pdf ikonunu döndürür
 * getFileIcon("image.png") // Resim ikonunu döndürür
 * getFileIcon("archive.zip") // Arşiv ikonunu döndürür
 */
export const getFileIcon = (fileName: string): JSX.Element => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'pdf':
      return <FaFilePdf />;
    case 'doc':
    case 'docx':
      return <FaFileWord />;
    case 'xls':
    case 'xlsx':
      return <FaFileExcel />;
    case 'ppt':
    case 'pptx':
      return <FaFilePowerpoint />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'webp':
      return <FaFileImage />;
    case 'zip':
    case 'rar':
    case '7z':
      return <FaFileArchive />;
    case 'mp3':
    case 'wav':
    case 'ogg':
      return <FaFileAudio />;
    case 'mp4':
    case 'mov':
    case 'avi':
    case 'mkv':
      return <FaFileVideo />;
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
    case 'html':
    case 'css':
    case 'json':
    case 'xml':
      return <FaFileCode />;
    default:
      return <FaFileAlt />;
  }
}; 