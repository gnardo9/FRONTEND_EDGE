import React from 'react';
import logo from '../../src/assets/LOGO.jpeg'; // Adjust the path accordingly
import '../../src/styles/Header.scss';
const Header: React.FC = () => {
    return (
        <div className="header">
          <img src={logo} alt="Company Logo" />
          <h1>Edge Automação</h1>
        </div>
      );
    };
    

export default Header;