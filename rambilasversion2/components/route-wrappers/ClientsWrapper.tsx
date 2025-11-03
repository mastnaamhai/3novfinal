import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Clients } from '../Clients';

export const ClientsWrapper: React.FC = () => {
  const context = useOutletContext<any>();
  
  return (
    <Clients 
      customers={context.customers} 
      onSave={context.saveCustomer} 
      onDelete={context.handleDeleteCustomer} 
      onBack={() => context.navigate('/dashboard')} 
    />
  );
};



