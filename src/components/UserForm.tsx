import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface UserData {
    company: number;
    nome: string;
    cargo: string;
    email: string;
    password: string;
    telefone?: string;
    is_active?: boolean;
    is_staff?: boolean;
    is_superuser?: boolean;
}

const UserForm: React.FC = () => {
    const [userData, setUserData] = useState<UserData>({ company: 1 , nome: '', cargo: '', email: '', password: '' });
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.post('https://edgeautomacao-4-0.onrender.com/api/users/', userData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log(response)
            toast.success('Usuário criado com sucesso');
            navigate('/users');
        } catch (error) {
            toast.error('Erro ao criar usuário');
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <input name="nome" value={userData.nome} onChange={handleChange} placeholder="Nome" required />
                <input name="cargo" value={userData.cargo} onChange={handleChange} placeholder="Cargo" required />
                <input name="email" type="email" value={userData.email} onChange={handleChange} placeholder="Email" required />
                <input name="password" type="password" value={userData.password} onChange={handleChange} placeholder="Password" required />
                <input name="telefone" value={userData.telefone || ''} onChange={handleChange} placeholder="Telefone" />
                <label>
                    <input name="is_superuser" type="checkbox" checked={userData.is_superuser || false} onChange={(e) => setUserData({...userData, is_superuser: e.target.checked})} />
                    Administrador
                </label>
                <button type="submit">Cadastrar</button>
            </form>
        </>
    );
};

export default UserForm;



