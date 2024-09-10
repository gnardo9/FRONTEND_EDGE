import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/CompanyForm.scss'; // Atualize para usar SCSS

const CompanyForm: React.FC = () => {
    const [formData, setFormData] = useState({
        razao_social: '',
        fantasia: '',
        cnpj: '',
        telefone: '',
        cep: '',
        endereco: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        pais: 'Brasil',
        tipo: 'Matriz',
    });
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        let newValue = value;
        if (name === 'cnpj') {
            newValue = value.replace(/\D/g, ''); // Remove caracteres não numéricos
        }

        setFormData({ ...formData, [name]: newValue });

        if (name === 'cep' && newValue.length === 8) {
            fetchAddress(newValue);
        }
    };

    const fetchAddress = async (cep: string) => {
        try {
            const response = await axios.get(`https://edgeautomacao-4-0.onrender.com/api/viacep/${cep}/`);
            const data = response.data;
            setFormData(prevState => ({
                ...prevState,
                endereco: data.logradouro || '',
                bairro: data.bairro || '',
                cidade: data.localidade || '',
                estado: data.uf || '',
                cep: cep // Garantir que o CEP não seja alterado
            }));
        } catch (error) {
            toast.error('Erro ao buscar endereço. Verifique o CEP e tente novamente.');
            console.error('Erro ao buscar endereço:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const accessToken = localStorage.getItem('accessToken');

            console.log('Form Data:', formData);
            console.log('Access Token:', accessToken);

            const response = await axios.post(
                'https://edgeautomacao-4-0.onrender.com/api/companies/',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            console.log('Response:', response.data); // Log the response data

            toast.success('Empresa cadastrada com sucesso');
            navigate('/welcome');
        } catch (error: any) {
            console.error('Erro ao cadastrar empresa:', error);
            if (error.response) {
                console.error('Response Data:', error.response.data); // Log the response data
                if (error.response.data.detail === 'Given token not valid for any token type') {
                    toast.error('Token inválido. Por favor, faça login novamente.');
                } else {
                    toast.error('Erro ao cadastrar empresa. Tente novamente.');
                }
            } else {
                toast.error('Erro ao cadastrar empresa. Tente novamente.');
            }
        }
    };

    return (
        <div className="company-form-container">
            <h2>Cadastre sua empresa</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Razão Social</label>
                    <input type="text" name="razao_social" value={formData.razao_social} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Nome Fantasia</label>
                    <input type="text" name="fantasia" value={formData.fantasia} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>CNPJ</label>
                    <input type="text" name="cnpj" value={formData.cnpj} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Telefone</label>
                    <input type="text" name="telefone" value={formData.telefone} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>CEP</label>
                    <input 
                        type="text" 
                        name="cep" 
                        value={formData.cep} 
                        onChange={handleChange} 
                        required 
                        autoComplete="new-password" // Custom attribute to disable autocomplete
                        onFocus={(e) => e.target.setAttribute('autocomplete', 'new-password')}
                    />
                </div>
                <div className="form-group">
                    <label>Endereço</label>
                    <input type="text" name="endereco" value={formData.endereco} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Número</label>
                    <input type="text" name="numero" value={formData.numero} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Bairro</label>
                    <input type="text" name="bairro" value={formData.bairro} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Cidade</label>
                    <input type="text" name="cidade" value={formData.cidade} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Estado</label>
                    <input type="text" name="estado" value={formData.estado} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>País</label>
                    <input type="text" name="pais" value={formData.pais} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Tipo</label>
                    <select name="tipo" value={formData.tipo} onChange={handleChange} required>
                        <option value="Matriz">Matriz</option>
                        <option value="Filial">Filial</option>
                    </select>
                </div>
                <button type="submit" className="submit-btn">Cadastrar</button>
            </form>
        </div>
    );
};

export default CompanyForm;
