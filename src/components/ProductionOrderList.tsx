import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface ProductionOrder {
  id: number;
  name: string;
  quantity: number;
  codigo: string;
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProductionOrder[];
}

const ProductionOrderList: React.FC = () => {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  const fetchOrders = async (page: number) => {
    const token = localStorage.getItem('accessToken');
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<ApiResponse>(`https://edgeautomacao-4-0.onrender.com/api/production-orders/?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Request URL:', `https://edgeautomacao-4-0.onrender.com/api/production-orders/?page=${page}`);
      console.log('Request Headers:', response.config.headers);
      console.log('Response Status:', response.status);
      console.log('Response Headers:', response.headers);
      console.log('Response Data:', response.data);

      setOrders(response.data.results || []);
      setTotalPages(Math.ceil(response.data.count / 20)); // Assuming 20 items per page
    } catch (error) {
      setOrders([]);
      if (axios.isAxiosError(error)) {
        toast.error(`Erro ao buscar ordens de produção: ${error.message}`);
        setError(`Erro ao buscar ordens de produção: ${error.message}`);

        console.error('Request URL:', `https://edgeautomacao-4-0.onrender.com/api/production-orders/?page=${page}`);
        if (error.config) {
          console.error('Request Headers:', error.config.headers);
        }
        console.error('Error Message:', error.message);
        if (error.response) {
          console.error('Response Status:', error.response.status);
          console.error('Response Headers:', error.response.headers);
          console.error('Response Data:', error.response.data);
        }
      } else {
        toast.error('Erro desconhecido ao buscar ordens de produção');
        setError('Erro desconhecido ao buscar ordens de produção');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div>
      <h1>Ordens de Produção</h1>
      {loading ? (
        <p>Carregando...</p>
      ) : error ? (
        <p>{error}</p>
      ) : orders.length === 0 ? (
        <p>Nenhuma ordem de produção encontrada.</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Quantidade</th>
                <th>Código Interno</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>{order.name}</td>
                  <td>{order.quantity}</td>
                  <td>{order.codigo}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            <button onClick={handlePreviousPage} disabled={currentPage === 1}>
              Página Anterior
            </button>
            <span>{currentPage} de {totalPages}</span>
            <button onClick={handleNextPage} disabled={currentPage === totalPages}>
              Próxima Página
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductionOrderList;









