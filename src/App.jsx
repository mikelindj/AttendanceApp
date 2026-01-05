import React, { useState, useEffect } from 'react';
import {
  FluentProvider,
  webLightTheme,
  Button,
  Card,
  Spinner,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  makeStyles,
  tokens,
  Text,
  Title1,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader,
  TableHeaderCell,
} from '@fluentui/react-components';
import { Add24Regular, Delete24Regular, Edit24Regular } from '@fluentui/react-icons';

// Backend API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://your-api-url.com';

const useStyles = makeStyles({
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '16px',
    minHeight: '100vh',
    '@media (min-width: 768px)': {
      padding: '24px',
    },
  },
  header: {
    marginBottom: '24px',
    padding: '20px',
    backgroundColor: tokens.colorBrandBackground,
    borderRadius: tokens.borderRadiusLarge,
    color: 'white',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
  },
  table: {
    marginTop: '20px',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
});

function App() {
  const styles = useStyles();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchItems();
  }, []);

  // Get user principal name from Teams
  const getUserPrincipalName = async () => {
    let userPrincipalName = '';
    if (window.microsoftTeams) {
      try {
        const context = await window.microsoftTeams.app.getContext();
        userPrincipalName = context.user?.userPrincipalName || context.user?.loginHint || '';
      } catch (err) {
        console.warn('Could not get user context:', err);
      }
    }
    return userPrincipalName;
  };

  // CREATE - Add new item
  const createItem = async () => {
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      const userPrincipalName = await getUserPrincipalName();
      
      const response = await fetch(`${API_BASE_URL}/api/dataverse.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          createdBy: userPrincipalName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create item');
      }

      const newItem = await response.json();
      setItems([...items, newItem]);
      setFormData({ name: '', description: '' });
      alert('Item created successfully!');
    } catch (err) {
      console.error('Error creating item:', err);
      alert('Error creating item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // READ - Fetch all items
  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/dataverse.php`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setItems(data.items || []);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // UPDATE - Edit existing item
  const updateItem = async (id) => {
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      const userPrincipalName = await getUserPrincipalName();
      
      const response = await fetch(`${API_BASE_URL}/api/dataverse.php`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          ...formData,
          modifiedBy: userPrincipalName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      const updatedItem = await response.json();
      setItems(items.map(item => item.id === id ? updatedItem : item));
      setEditingItem(null);
      setFormData({ name: '', description: '' });
      alert('Item updated successfully!');
    } catch (err) {
      console.error('Error updating item:', err);
      alert('Error updating item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // DELETE - Remove item
  const deleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/dataverse.php`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      setItems(items.filter(item => item.id !== id));
      alert('Item deleted successfully!');
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Error deleting item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item.id);
    setFormData({ name: item.name || '', description: item.description || '' });
  };

  const handleCancel = () => {
    setEditingItem(null);
    setFormData({ name: '', description: '' });
  };

  return (
    <FluentProvider theme={webLightTheme}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <Title1 style={{ color: 'white', marginBottom: '8px' }}>Attendance - ACS(A)</Title1>
          <Text size={400} style={{ color: 'white', opacity: 0.9 }}>
            Dataverse CRUD Operations
          </Text>
        </div>

        {/* Error Message */}
        {error && (
          <MessageBar intent="error" style={{ marginBottom: '20px' }}>
            <MessageBarTitle>Error</MessageBarTitle>
            <MessageBarBody>
              {error}
              <Button 
                appearance="primary" 
                onClick={fetchItems}
                style={{ marginLeft: '20px' }}
              >
                Retry
              </Button>
            </MessageBarBody>
          </MessageBar>
        )}

        {/* Form */}
        <Card style={{ padding: '20px', marginBottom: '20px' }}>
          <Title1 size={500} style={{ marginBottom: '16px' }}>
            {editingItem ? 'Edit Item' : 'Create New Item'}
          </Title1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <Label htmlFor="name" required>Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter name..."
                disabled={isSubmitting}
                style={{ marginTop: '8px' }}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description..."
                disabled={isSubmitting}
                style={{ marginTop: '8px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                appearance="primary"
                onClick={editingItem ? () => updateItem(editingItem) : createItem}
                disabled={isSubmitting || !formData.name.trim()}
                icon={editingItem ? <Edit24Regular /> : <Add24Regular />}
              >
                {isSubmitting ? 'Saving...' : editingItem ? 'Update' : 'Create'}
              </Button>
              {editingItem && (
                <Button
                  appearance="secondary"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className={styles.loadingContainer}>
            <Spinner label="Loading items..." size="large" />
          </div>
        )}

        {/* Items Table */}
        {!loading && !error && (
          <Card style={{ padding: '20px' }}>
            <Title1 size={500} style={{ marginBottom: '16px' }}>
              Items ({items.length})
            </Title1>
            {items.length > 0 ? (
              <Table className={styles.table}>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>Name</TableHeaderCell>
                    <TableHeaderCell>Description</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.description || '-'}</TableCell>
                      <TableCell>
                        <div className={styles.actionButtons}>
                          <Button
                            appearance="subtle"
                            icon={<Edit24Regular />}
                            onClick={() => handleEdit(item)}
                            disabled={isSubmitting}
                          >
                            Edit
                          </Button>
                          <Button
                            appearance="subtle"
                            icon={<Delete24Regular />}
                            onClick={() => deleteItem(item.id)}
                            disabled={isSubmitting}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Text>No items found. Create your first item above.</Text>
            )}
          </Card>
        )}
      </div>
    </FluentProvider>
  );
}

export default App;

