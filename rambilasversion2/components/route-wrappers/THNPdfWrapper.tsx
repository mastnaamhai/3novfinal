import React from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { THNPdf } from '../THNPdf';

export const THNPdfWrapper: React.FC = () => {
  const context = useOutletContext<any>();
  const { id } = useParams();
  
  const thn = context.truckHiringNotes.find((thn: any) => thn._id === id);
  
  if (!thn) {
    return <div>THN not found</div>;
  }
  
  return (
    <THNPdf 
      thn={thn} 
      companyInfo={context.companyInfo} 
      onBack={() => context.navigate('/truck-hiring')} 
    />
  );
};



