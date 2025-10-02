import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="container mx-auto  px-4">
      <div className="flex flex-row justify-between items-start md:items-center py-3 gap-3">
        <div className="flex flex-col">
          <p className="text-sm md:text-md uppercase tracking-widest text-black flex items-center gap-1">
            Alfin Dwi
          </p>
          <p className="text-xs md:text-sm text-black">
            © 2025 Alfin Dwi Wadani
          </p>
        </div>

        <div className="flex gap-3 mt-2">
          <a
            href="https://github.com/alfindwi"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub className="text-xl text-black hover:text-black" />
          </a>
          <a
            href="https://linkedin.com/in/alfin-dwi-wadani"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaLinkedin className="text-xl text-black hover:text-black" />
          </a>
          <a
            href="https://instagram.com/alvindvvi"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram className="text-xl text-black hover:text-black" />
          </a>
        </div>
      </div>
    </footer>
  );
}
