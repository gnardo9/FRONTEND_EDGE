import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import '../styles/LoginForm.scss'; // Atualize para usar SCSS

const LoginForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://edgeautomacao-4-0.onrender.com/api/token/', { email, password });
            localStorage.setItem('accessToken', response.data.access);
            localStorage.setItem('refreshToken', response.data.refresh);

            // Assuming the backend returns the user's name along with the tokens
            const userProfileResponse = await axios.get('https://edgeautomacao-4-0.onrender.com/api/me/', {
                headers: {
                    Authorization: `Bearer ${response.data.access}`,
                },
            });

            localStorage.setItem('userName', userProfileResponse.data.nome);
            toast.success('Login bem-sucedido');
            navigate('/welcome');
        } catch (error) {
            toast.error('Erro ao fazer login. Verifique suas credenciais.');
            console.error('Erro ao fazer login:', error);
        }
    };

    const handleRegister = () => {
        console.log('Navegando para /register-superuser');
        navigate('/register-superuser');
    };

    return (
        <div className="login-form-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Senha</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="submit-btn">Login</button>
            </form>
            <button className="register-btn" onClick={handleRegister}>Cadastre-se</button>
        </div>
    );
};

export default LoginForm;