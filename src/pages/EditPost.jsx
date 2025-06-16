import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Paper,
  CircularProgress,
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { postsService } from '../services/api';

const PostSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters')
    .required('Title is required'),
  description: Yup.string()
    .min(10, 'Description must be at least 10 characters')
    .required('Description is required'),
  image: Yup.string()
    .url('Must be a valid URL')
    .required('Image URL is required'),
});

const EditPost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = () => {
    setLoading(true);
    postsService.getPost(postId)
      .then(data => {
        setPost(data);
        setError('');
      })
      .catch(err => {
        setError('Failed to load post');
        console.error('Error loading post:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSubmit = (values, { setSubmitting }) => {
    postsService.updatePost(postId, values)
      .then(() => {
        navigate('/');
      })
      .catch(err => {
        setError('Failed to update post');
        console.error('Error updating post:', err);
        setSubmitting(false);
      });
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !post) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="md" sx={{ mt: '90px' }}>
        <Paper elevation={0} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Edit Post
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Formik
            initialValues={{
              title: post?.title || '',
              description: post?.description || '',
              image: post?.image || ''
            }}
            validationSchema={PostSchema}
            onSubmit={handleSubmit}
            enableReinitialize
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
                </Box>

                <Box sx={{ mb: 3 }}>
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
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Field
                    as={TextField}
                    name="image"
                    label="Image URL"
                    fullWidth
                    margin="normal"
                    error={touched.image && errors.image}
                    helperText={touched.image && errors.image}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    startIcon={<Save />}
                  >
                    Save Changes
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

export default EditPost;

