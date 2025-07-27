// Footer.tsx
import React from 'react';
import { FaFacebook, FaLinkedin, FaEnvelope, FaGithub } from 'react-icons/fa';

export function Footer() {
  return (
    <footer className="bg-white rounded-lg shadow dark:bg-gray-800">
      <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
        <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
          © 2025{" "}
          <a
            href="https://ash-portfolio-five.vercel.app"
            className="hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            John Ashley D. Villanueva
          </a>
          . All Rights Reserved.
        </span>
        <div className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
          <a
            href="https://www.facebook.com/AZHLEEH"
            className="hover:text-gray-900 dark:hover:text-white mr-4 md:mr-6"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebook className="inline mr-1" size={18} />
            Facebook
          </a>
          <a
            href="https://www.linkedin.com/in/john-ashley-villanueva-29b607265/"
            className="hover:text-gray-900 dark:hover:text-white mr-4 md:mr-6"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaLinkedin className="inline mr-1" size={18} />
            LinkedIn
          </a>
          <a
            href="mailto:villanuevajohn519@gmail.com"
            className="hover:text-gray-900 dark:hover:text-white mr-4 md:mr-6"
          >
            <FaEnvelope className="inline mr-1" size={18} />
            Email
          </a>
          <a
            href="https://github.com/Ashlipogi"
            className="hover:text-gray-900 dark:hover:text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub className="inline mr-1" size={18} />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
