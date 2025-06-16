import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import PostCard from '../components/PostCard';
import { postsService, likesService, bookmarksService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Bookmarks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  useEffect(() => {
    loadBookmarkedPosts();
  }, [user]);

  const loadBookmarkedPosts = () => {
    if (!user) return;
    
    setLoading(true);
    
    // Get user's bookmarks
    bookmarksService.getBookmarksForUser(user.id)
      .then(bookmarks => {
        if (bookmarks.length === 0) {
          setBookmarkedPosts([]);
          setLoading(false);
          return;
        }
        
        // Get all posts and filter by bookmarked ones
        return postsService.getAllPosts()
          .then(allPosts => {
            const bookmarkedPostIds = bookmarks.map(b => b.postId);
            const filteredPosts = allPosts.filter(post => 
              bookmarkedPostIds.includes(post.id)
            );
            setBookmarkedPosts(filteredPosts);
          });
      })
      .catch(err => {
        setError('Failed to load bookmarked posts');
        console.error('Error loading bookmarked posts:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleLike = (postId, isLiked) => {
    if (isLiked) {
      likesService.likePost(postId, user.id)
        .then(() => {
          console.log('Post liked successfully');
        })
        .catch(err => {
          console.error('Error liking post:', err);
        });
    } else {
      likesService.unlikePost(postId, user.id)
        .then(() => {
          console.log('Post unliked successfully');
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
          console.log('Post bookmarked successfully');
        })
        .catch(err => {
          console.error('Error bookmarking post:', err);
        });
    } else {
      bookmarksService.removeBookmark(postId, user.id)
        .then(() => {
          console.log('Bookmark removed successfully');
          // Remove the post from the bookmarked posts list
          setBookmarkedPosts(prev => prev.filter(post => post.id !== postId));
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
          setBookmarkedPosts(prev => prev.filter(post => post.id !== postToDelete));
          toast.success('Post deleted successfully!', {
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
        ) : bookmarkedPosts.length === 0 ? (
          <Box textAlign="center" mt={4}>
            <Typography variant="h6" color="text.secondary">
              No bookmarks yet. Start saving your favorite posts!
            </Typography>
          </Box>
        ) : (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Your Bookmarks
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
              {bookmarkedPosts.map((bookmark) => (
                <Grid item key={bookmark.id}>
                  <PostCard
                    post={bookmark}
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
      </Container>
    </>
  );
};

export default Bookmarks;

