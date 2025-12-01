import './HamburgerMenu.css';

const HamburgerMenu = ({ isOpen, onToggle }) => {
  return (
    <button
      className={`hamburger-button ${isOpen ? 'open' : ''}`}
      onClick={onToggle}
      aria-label="Toggle menu"
      aria-expanded={isOpen}
    >
      <span className="hamburger-line"></span>
      <span className="hamburger-line"></span>
      <span className="hamburger-line"></span>
    </button>
  );
};

export default HamburgerMenu;
