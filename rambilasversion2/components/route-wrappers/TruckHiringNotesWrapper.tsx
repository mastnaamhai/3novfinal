import React from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { TruckHiringNotes } from '../TruckHiringNotes';

export const TruckHiringNotesWrapper: React.FC = () => {
  const context = useOutletContext<any>();
  const [searchParams] = useSearchParams();
  
  const filters = {
    status: searchParams.get('status') || undefined,
    truckOwner: searchParams.get('truckOwner') || undefined,
    dateFrom: searchParams.get('dateFrom') || undefined,
    dateTo: searchParams.get('dateTo') || undefined,
  };
  
  return (
    <TruckHiringNotes 
      notes={context.truckHiringNotes} 
      payments={context.payments}
      companyInfo={context.companyInfo}
      onSave={context.saveTruckHiringNote} 
      onUpdate={context.updateTruckHiringNoteHandler}
      onDelete={context.deleteTruckHiringNoteHandler}
      onSavePayment={context.savePayment}
      onViewChange={(view) => {
        switch (view.name) {
          case 'VIEW_THN':
            context.navigate(`/truck-hiring/view/${view.id}`);
            break;
          default:
            context.navigate('/truck-hiring');
        }
      }} 
      onBack={() => context.navigate('/dashboard')} 
      initialFilters={filters} 
    />
  );
};



