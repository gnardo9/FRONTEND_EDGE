import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/UserList.scss';

// Definir o elemento do aplicativo para o Modal
Modal.setAppElement('#root');

interface User {
    id: number;
    nome: string;
    cargo: string;
    email: string;
    telefone?: string;
    is_superuser?: boolean;
}

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            const token = localStorage.getItem('accessToken');
            try {
                const response = await axios.get('https://edgeautomacao-4-0.onrender.com/api/users/list/', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUsers(response.data);
            } catch (error) {
                console.error('Failed to fetch users:', error);
                toast.error('Erro ao buscar usuários');
            }
        };
        fetchUsers();
    }, []);

    const handleDelete = async (id: number) => {
        const token = localStorage.getItem('accessToken');
        try {
            await axios.delete(`https://edgeautomacao-4-0.onrender.com/api/users/${id}/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUsers(users.filter(user => user.id !== id));
            toast.success('Usuário deletado com sucesso');
        } catch (error) {
            console.error('Erro ao deletar usuário:', error);
            toast.error('Erro ao deletar usuário');
        }
    };

    const handleEdit = (user: User) => {
        setEditUser(user);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditUser(null);
    };

    const handleSave = async () => {
        if (!editUser) return;
        const token = localStorage.getItem('accessToken');
        try {
            await axios.patch(`https://edgeautomacao-4-0.onrender.com/api/users/${editUser.id}/`, editUser, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUsers(users.map(user => (user.id === editUser.id ? editUser : user)));
            handleCloseModal();
            toast.success('Usuário atualizado com sucesso');
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            toast.error('Erro ao atualizar usuário');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (editUser) {
            const { name, value, type, checked } = e.target;
            setEditUser({ ...editUser, [name]: type === 'checkbox' ? checked : value });
        }
    };

    return (
        <>
            <div className="user-list">
                <button className="add-user-button" onClick={() => navigate('/cadastro-usuario')}>
                    Adicionar Usuário
                </button>
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Telefone</th>
                            <th>Cargo</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.nome}</td>
                                <td>{user.email}</td>
                                <td>{user.telefone}</td>
                                <td>{user.cargo}</td>
                                <td>
                                    <button onClick={() => handleEdit(user)}>Editar</button>
                                    <button onClick={() => handleDelete(user.id)}>Deletar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <Modal
                    isOpen={modalOpen}
                    onRequestClose={handleCloseModal}
                    contentLabel="Editar Usuário"
                >
                    {editUser && (
                        <div className="modal-content">
                            <h3>Editar Usuário</h3>
                            <input name="nome" value={editUser.nome} onChange={handleChange} placeholder="Nome" required />
                            <input name="cargo" value={editUser.cargo} onChange={handleChange} placeholder="Cargo" required />
                            <input name="email" type="email" value={editUser.email} onChange={handleChange} placeholder="Email" required />
                            <input name="telefone" value={editUser.telefone || ''} onChange={handleChange} placeholder="Telefone" />
                            <label>
                                <input name="is_superuser" type="checkbox" checked={editUser.is_superuser || false} onChange={handleChange} />
                                Administrador
                            </label>
                            <button onClick={handleSave}>Salvar</button>
                            <button onClick={handleCloseModal}>Cancelar</button>
                        </div>
                    )}
                </Modal>
            </div>
        </>
    );
};

export default UserList;



