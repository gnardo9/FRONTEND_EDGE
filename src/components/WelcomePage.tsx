import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/WelcomePage.scss";
import companyImage from "../assets/TELA DESCANSO IHM.jpeg"; // Substitua pelo caminho correto da imagem

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  return (
    <div className="welcome-page">
      <div className="left-section">
        <div className="image-container">
          <img src={companyImage} alt="Company" />
        </div>
        <h1>Bem-vindo(a) à Edge Automação!</h1>
        <p>Gerencie suas operações com facilidade.</p>
      </div>
      <div className="right-section">
        <div className="welcome-container">
          <h2>Olá {userName}, seja bem-vindo(a) à Edge Automação!</h2>
          <div className="button-group">
            <button onClick={() => handleNavigation("/cadastro-empresa")}>
              Cadastrar Empresa
            </button>
            <button onClick={() => handleNavigation("/users")}>
              Cadastrar Usuário
            </button>
            <button onClick={() => handleNavigation("/turns")}>
              Cadastrar Turnos
            </button>
            <button onClick={() => handleNavigation("/sections")}>
              Cadastrar Setores
            </button>
            <button onClick={() => handleNavigation("/stopping-reasons")}>
              Cadastrar Motivos de Parada
            </button>
            <button onClick={() => handleNavigation("/machines")}>
              Cadastrar Máquinas
            </button>
            <button onClick={() => handleNavigation("/machine-data")}>
              Ver Dados da Máquina
            </button>
            <button onClick={() => handleNavigation("/settings")}>
              Configurações
            </button>
            <button onClick={() => handleNavigation("/production-orders")}>
              Listar Ordens de Produção
            </button>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;


