import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/SuperUserForm.scss';

const SuperUserForm: React.FC = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nome: '',
        cargo: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        console.log('SuperUserForm carregado');
        const checkSuperUserExists = async () => {
            try {
                const response = await axios.get('https://edgeautomacao-4-0.onrender.com/api/check-superuser/');
                if (response.data.superuser_exists) {
                    toast.warning('Já existe um superusuário cadastrado.');
                    navigate('/login');
                }
            } catch (error) {
                console.error('Erro ao verificar existência de superusuário:', error);
            }
        };

        checkSuperUserExists();
    }, [navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('https://edgeautomacao-4-0.onrender.com/api/create-superuser/', formData);
            toast.success('Superusuário criado com sucesso');
            navigate('/login');
        } catch (error) {
            toast.error('Erro ao criar superusuário. Tente novamente.');
            console.error('Erro ao criar superusuário:', error);
        }
    };

    return (
        <div className="superuser-form-container">
            <h2>Criar Superusuário</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Senha</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Nome</label>
                    <input type="text" name="nome" value={formData.nome} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Cargo</label>
                    <input type="text" name="cargo" value={formData.cargo} onChange={handleChange} required />
                </div>
                <button type="submit" className="submit-btn">Criar Superusuário</button>
            </form>
        </div>
    );
};

export default SuperUserForm;
