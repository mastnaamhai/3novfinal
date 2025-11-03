import { useOutletContext } from 'react-router-dom';
import { Settings } from '../Settings';

export const SettingsWrapper = () => {
  const context = useOutletContext<any>();
  
  return (
    <Settings 
      lorryReceipts={context.lorryReceipts}
      invoices={context.invoices}
      payments={context.payments}
      customers={context.customers}
      truckHiringNotes={context.truckHiringNotes}
      onPasswordChange={context.handleChangePassword}
      onResetData={context.handleResetData}
      onResetBusinessData={context.handleResetBusinessData}
      onResetAllData={context.handleResetAllData}
      onBackup={context.handleBackup}
      onRestore={context.handleRestore}
      onBack={() => context.navigate('/dashboard')}
    />
  );
};



