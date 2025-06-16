import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Grid,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import PostCard from '../components/PostCard';
import { postsService, likesService, bookmarksService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Add as AddIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';

const Homepage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

 
  const searchQuery = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('search') || '';
  }, [location.search]);

  
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;

    const query = searchQuery.toLowerCase().trim();
    const queryWords = query.split(/\s+/);

    return posts.filter(post => {
      const title = post.title.toLowerCase();
      const description = post.description.toLowerCase();
      
      
      return queryWords.every(word => 
        title.includes(word) || description.includes(word)
      );
    });
  }, [posts, searchQuery]);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = () => {
    setLoading(true);
    postsService.getAllPosts()
      .then(data => {
        setPosts(data);
        setError('');
      })
      .catch(err => {
        setError('Failed to load posts');
        console.error('Error loading posts:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleLike = (postId, isLiked) => {
    if (isLiked) {
      likesService.likePost(postId, user.id)
        .then(() => {
          // Update the posts state to reflect the like
          setPosts(posts.map(post => 
            post.id === postId 
              ? { ...post, likes: [...(post.likes || []), user.id] }
              : post
          ));
        })
        .catch(err => {
          console.error('Error liking post:', err);
        });
    } else {
      likesService.unlikePost(postId, user.id)
        .then(() => {
          // Update the posts state to reflect the unlike
          setPosts(posts.map(post => 
            post.id === postId 
              ? { ...post, likes: (post.likes || []).filter(id => id !== user.id) }
              : post
          ));
        })
        .catch(err => {
          console.error('Error unliking post:', err);
        });
    }
  };

  const handleBookmark = (postId, isBookmarked) => {
    if (isBookmarked) {
      bookmarksService.bookmarkPost(postId, user.id)
        .then(() => {
          
          setPosts(posts.map(post => 
            post.id === postId 
              ? { ...post, bookmarks: [...(post.bookmarks || []), user.id] }
              : post
          ));
        })
        .catch(err => {
          console.error('Error bookmarking post:', err);
        });
    } else {
      bookmarksService.removeBookmark(postId, user.id)
        .then(() => {
          
          setPosts(posts.map(post => 
            post.id === postId 
              ? { ...post, bookmarks: (post.bookmarks || []).filter(id => id !== user.id) }
              : post
          ));
        })
        .catch(err => {
          console.error('Error removing bookmark:', err);
        });
    }
  };

  const handleEdit = (post) => {
    navigate(`/edit-post/${post.id}`);
  };

  const handleDelete = (postId) => {
    setPostToDelete(postId);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    setOpenDeleteDialog(false);
    if (postToDelete) {
      postsService.deletePost(postToDelete)
        .then(() => {
          setPosts(posts.filter(post => post.id !== postToDelete));
          toast.error('Post deleted successfully!', {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        })
        .catch(err => {
          console.error('Error deleting post:', err);
          setError('Failed to delete post');
          toast.error('Failed to delete post.', {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        })
        .finally(() => {
          setPostToDelete(null);
        });
    }
  };

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
    setPostToDelete(null);
  };

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: '90px' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : filteredPosts.length === 0 ? (
          <Box textAlign="center" mt={4}>
            <Typography variant="h6" color="text.secondary">
              {searchQuery.trim() ? 'No posts found matching your search.' : 'No posts yet. Be the first to share a photo!'}
            </Typography>
          </Box>
        ) : (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              {searchQuery.trim() ? `Search Results for "${searchQuery}"` : 'Latest Posts'}
            </Typography>
            
            <Grid 
              container 
              spacing={3} 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: 3,
                '& > *': {
                  width: '100% !important',
                  maxWidth: '100% !important',
                  flexBasis: '100% !important',
                }
              }}
            >
              {filteredPosts.map((post) => (
                <Grid item key={post.id}>
                  <PostCard
                    post={post}
                    onLike={handleLike}
                    onBookmark={handleBookmark}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>

      {user && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 30,
            right: 30,
            zIndex: 1000,
          }}
          onClick={() => navigate('/add-post')}
        >
          <AddIcon />
        </Fab>
      )}

      <Dialog
        open={openDeleteDialog}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <Typography id="delete-dialog-description">
            Are you sure you want to delete this post? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Homepage;

