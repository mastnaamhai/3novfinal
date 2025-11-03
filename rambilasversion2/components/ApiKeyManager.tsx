import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { ConfirmationModal } from './ui/ConfirmationModal';
import { useApiKeys } from '../hooks/useApiKeys';

export const ApiKeyManager: React.FC = () => {
  const { apiKeys, isLoading, error, saveApiKey, removeApiKey, getKeyValue } = useApiKeys();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState<{ keyType: string; description?: string } | null>(null);
  const [formData, setFormData] = useState({
    keyType: 'gstin' as 'gstin' | 'other',
    keyValue: '',
    description: '',
    password: ''
  });
  const [viewPassword, setViewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleAddClick = () => {
    setFormData({
      keyType: 'gstin',
      keyValue: '',
      description: '',
      password: ''
    });
    setShowAddModal(true);
  };

  const handleEditClick = (keyType: string, description?: string) => {
    setSelectedKey({ keyType, description });
    setFormData({
      keyType: keyType as 'gstin' | 'other',
      keyValue: '',
      description: description || '',
      password: ''
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (keyType: string, description?: string) => {
    setSelectedKey({ keyType, description });
    setFormData({ ...formData, password: '' });
    setShowDeleteModal(true);
  };

  const handleViewClick = (keyType: string, description?: string) => {
    setSelectedKey({ keyType, description });
    setViewPassword('');
    setShowViewModal(true);
  };

  const handleSubmit = async (password: string) => {
    setIsSubmitting(true);
    setMessage('');
    setIsError(false);

    try {
      await saveApiKey(
        formData.keyType,
        formData.keyValue,
        formData.description,
        formData.password // Use the password from form data, not the parameter
      );
      setMessage('API key saved successfully!');
      setIsError(false);
      setShowAddModal(false);
      setShowEditModal(false);
      setFormData({
        keyType: 'gstin',
        keyValue: '',
        description: '',
        password: ''
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save API key');
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (password: string) => {
    if (!selectedKey) return;
    
    setIsSubmitting(true);
    try {
      await removeApiKey(selectedKey.keyType, password);
      setMessage('API key deleted successfully!');
      setIsError(false);
      setShowDeleteModal(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to delete API key');
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleView = async (password: string) => {
    if (!selectedKey) return;

    setIsSubmitting(true);
    setMessage('');
    setIsError(false);

    try {
      const keyValue = await getKeyValue(selectedKey.keyType, password);
      setFormData(prev => ({ ...prev, keyValue: keyValue.keyValue }));
      setShowViewModal(false);
      setShowEditModal(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to fetch API key value');
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const gstinKey = apiKeys.find(key => key.keyType === 'gstin');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-800">API Key Management</h3>
          <p className="text-gray-600 mt-1">Manage your API keys for external services</p>
        </div>
        <Button onClick={handleAddClick} disabled={isLoading}>
          Add API Key
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {message && (
        <div className={`p-3 rounded-md ${isError ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
          <p className={`text-sm ${isError ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        </div>
      )}

      {/* Current API Keys */}
      <Card title="Current API Keys">
        <div className="space-y-4">
          {apiKeys.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No API keys configured</p>
          ) : (
            apiKeys.map((key) => (
              <div key={key._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900 capitalize">{key.keyType}</span>
                    <span className="text-sm text-gray-500">API Key</span>
                  </div>
                  {key.description && (
                    <p className="text-sm text-gray-600 mt-1">{key.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Created: {new Date(key.createdAt || '').toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleViewClick(key.keyType, key.description)}
                  >
                    View
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEditClick(key.keyType, key.description)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteClick(key.keyType, key.description)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* GST API Key Status */}
      {gstinKey && (
        <Card title="GST API Key Status" className="border-green-200">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span className="font-medium text-green-800">GST API Key is configured</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Your GST verification service is ready to use.
            </p>
          </div>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <ConfirmationModal
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
          setFormData({
            keyType: 'gstin',
            keyValue: '',
            description: '',
            password: ''
          });
          setMessage('');
          setIsError(false);
        }}
        onConfirm={handleSubmit}
        title={showAddModal ? 'Add API Key' : 'Edit API Key'}
        message=""
        confirmText={isSubmitting ? 'Saving...' : 'Save API Key'}
        cancelText="Cancel"
        isLoading={isSubmitting}
        requirePassword={false}
        destructive={false}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Key Type
            </label>
            <select
              value={formData.keyType}
              onChange={(e) => setFormData(prev => ({ ...prev, keyType: e.target.value as 'gstin' | 'other' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={showEditModal}
            >
              <option value="gstin">GSTIN Verification</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <Input
            label="API Key Value"
            type="text"
            value={formData.keyValue}
            onChange={(e) => setFormData(prev => ({ ...prev, keyValue: e.target.value }))}
            placeholder="Enter your API key"
            required
          />
          
          <Textarea
            label="Description (Optional)"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter a description for this API key"
            rows={2}
          />
          
          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            placeholder="Enter your password to confirm"
            required
          />
        </div>
      </ConfirmationModal>

      {/* View Modal */}
      <ConfirmationModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setViewPassword('');
          setMessage('');
          setIsError(false);
        }}
        onConfirm={handleView}
        title="View API Key"
        message="Enter your password to view the API key value:"
        confirmText={isSubmitting ? 'Loading...' : 'View Key'}
        cancelText="Cancel"
        isLoading={isSubmitting}
        requirePassword={true}
        destructive={false}
      />

      {/* Delete Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setFormData(prev => ({ ...prev, password: '' }));
          setMessage('');
          setIsError(false);
        }}
        onConfirm={handleDelete}
        title="Delete API Key"
        message={`Are you sure you want to delete the ${selectedKey?.keyType} API key? This action cannot be undone.`}
        confirmText={isSubmitting ? 'Deleting...' : 'Delete API Key'}
        cancelText="Cancel"
        isLoading={isSubmitting}
        requirePassword={true}
        destructive={true}
      />
    </div>
  );
};
