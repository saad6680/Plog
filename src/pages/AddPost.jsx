import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardMedia,
  IconButton
} from '@mui/material';
import { PhotoCamera, ArrowBack } from '@mui/icons-material';
import { postsService } from '../services/api';
import { toast } from 'react-toastify';

const PostSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters')
    .required('Title is required'),
  description: Yup.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters')
    .required('Description is required'),
  image: Yup.string()
    .url('Please enter a valid image URL')
    .required('Image is required')
});

const AddPost = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  const handleSubmit = (values, { setSubmitting }) => {
    setError('');
    postsService.createPost(values)
      .then(() => {
        toast.success('Post added successfully!', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        navigate('/');
      })
      .catch(err => {
        setError('Failed to create post. Please try again.');
        console.error('Error creating post:', err);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const handleImageUrlChange = (url, setFieldValue) => {
    setFieldValue('image', url);
    setImagePreview(url);
  };

  return (
    <>
      <Container maxWidth="md" sx={{ mt: '90px' }}>
        <Paper elevation={0} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Create New Post
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Formik
            initialValues={{
              title: '',
              description: '',
              image: ''
            }}
            validationSchema={PostSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting, setFieldValue }) => (
              <Form>
                <Box sx={{ mb: 3 }}>
                  <Field
                    as={TextField}
                    name="title"
                    label="Post Title"
                    fullWidth
                    margin="normal"
                    error={touched.title && errors.title}
                    helperText={touched.title && errors.title}
                  />
                  
                  <Field
                    as={TextField}
                    name="description"
                    label="Description"
                    fullWidth
                    multiline
                    rows={4}
                    margin="normal"
                    error={touched.description && errors.description}
                    helperText={touched.description && errors.description}
                  />
                  
                  <Field
                    as={TextField}
                    name="image"
                    label="Image URL"
                    fullWidth
                    margin="normal"
                    error={touched.image && errors.image}
                    helperText={touched.image && errors.image || 'Enter a direct link to your image'}
                    onChange={(e) => handleImageUrlChange(e.target.value, setFieldValue)}
                  />
                </Box>

                {/* Image Preview */}
                {imagePreview && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Image Preview
                    </Typography>
                    <Card sx={{ maxWidth: 400 }}>
                      <CardMedia
                        component="img"
                        height="300"
                        image={imagePreview}
                        alt="Preview"
                        sx={{ objectFit: 'cover' }}
                        onError={() => setImagePreview('')}
                      />
                    </Card>
                  </Box>
                )}

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} /> : <PhotoCamera />}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Post'}
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </Paper>
      </Container>
    </>
  );
};

export default AddPost;

