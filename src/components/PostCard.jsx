import React, { useState, useEffect } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Avatar,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Bookmark,
  BookmarkBorder,
  Edit,
  Delete,
  MoreVert,
  Login,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { likesService, bookmarksService } from '../services/api';

const PostCard = ({ post, onLike, onBookmark, onEdit, onDelete }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const isOwner = user && user.id === post.userId;

  useEffect(() => {
    if (user && post) {
      Promise.all([
        likesService.getLikesForPost(post.id),
        likesService.hasUserLikedPost(post.id, user.id),
        bookmarksService.hasUserBookmarkedPost(post.id, user.id)
      ])
        .then(([likes, userLiked, userBookmarked]) => {
          setLikesCount(likes.length);
          setLiked(userLiked);
          setBookmarked(userBookmarked);
        })
        .catch(err => {
          console.error('Error loading post status:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user, post]);

  const handleLoginPrompt = () => {
    setShowLoginDialog(true);
  };

  const handleCloseLoginDialog = () => {
    setShowLoginDialog(false);
  };

  const handleNavigateToLogin = () => {
    setShowLoginDialog(false);
    navigate('/login');
  };

  const handleLike = () => {
    if (!user) {
      handleLoginPrompt();
      return;
    }
    if (onLike) {
      onLike(post.id, !liked);
      setLiked(!liked);
      setLikesCount(prev => liked ? prev - 1 : prev + 1);
    }
  };

  const handleBookmark = () => {
    if (!user) {
      handleLoginPrompt();
      return;
    }
    if (onBookmark) {
      onBookmark(post.id, !bookmarked);
      setBookmarked(!bookmarked);
    }
  };

  const handleEdit = () => {
    if (!user) {
      handleLoginPrompt();
      return;
    }
    if (onEdit) {
      onEdit(post);
    }
  };

  const handleDelete = () => {
    if (!user) {
      handleLoginPrompt();
      return;
    }
    if (onDelete) {
      onDelete(post.id);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <Card 
        sx={{ 
          maxWidth: '100%',
          margin: 'auto',
          mb: 3,
          overflow: 'hidden',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          },
        }}
      >
        {/* Post Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}>
          <Avatar 
            sx={{ 
              mr: 2,
              width: 40,
              height: 40,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              fontSize: '1.1rem',
              fontWeight: 600,
            }}
          >
            {post.username ? post.username.charAt(0).toUpperCase() : 'U'}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" fontWeight="600" color="text.primary">
              {post.username || 'Unknown User'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(post.createdAt)}
            </Typography>
          </Box>
          {isOwner && (
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <MoreVert />
            </IconButton>
          )}
        </Box>

        {/* Post Image */}
        <CardMedia
          component="img"
          height="300"
          image={post.image}
          alt={post.title}
          sx={{ 
            objectFit: 'cover',
            width: '100%',
            aspectRatio: '16/9',
          }}
        />

        {/* Post Content */}
        <CardContent sx={{ p: 2.5 }}>
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              fontWeight: 600,
              fontSize: '1.25rem',
              color: 'text.primary',
              mb: 1,
            }}
          >
            {post.title}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              mb: 2,
              lineHeight: 1.6,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {post.description}
          </Typography>
          {likesCount > 0 && (
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                display: 'block',
                mb: 1,
                fontWeight: 500,
              }}
            >
              {likesCount} {likesCount === 1 ? 'like' : 'likes'}
            </Typography>
          )}
        </CardContent>

        {/* Post Actions */}
        <CardActions 
          sx={{ 
            justifyContent: 'space-between', 
            px: 2,
            py: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box>
            <IconButton 
              onClick={handleLike} 
              color={liked ? 'error' : 'default'}
              disabled={loading}
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'action.hover',
                },
              }}
            >
              {liked ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
            <IconButton 
              onClick={handleBookmark} 
              color={bookmarked ? 'primary' : 'default'}
              disabled={loading}
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'action.hover',
                },
              }}
            >
              {bookmarked ? <Bookmark /> : <BookmarkBorder />}
            </IconButton>
          </Box>
          
          {isOwner && (
            <Box>
              <IconButton 
                onClick={handleEdit} 
                color="primary" 
                size="small"
                sx={{ 
                  '&:hover': { 
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <Edit />
              </IconButton>
              <IconButton 
                onClick={handleDelete} 
                color="error" 
                size="small"
                sx={{ 
                  '&:hover': { 
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <Delete />
              </IconButton>
            </Box>
          )}
        </CardActions>
      </Card>

      <Dialog
        open={showLoginDialog}
        onClose={handleCloseLoginDialog}
        aria-labelledby="login-dialog-title"
      >
        <DialogTitle id="login-dialog-title">
          Login Required
        </DialogTitle>
        <DialogContent>
          <Typography>
            Please log in to interact with posts. You'll be able to like, bookmark, and create your own posts.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLoginDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleNavigateToLogin} 
            variant="contained" 
            color="primary"
            startIcon={<Login />}
          >
            Login
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PostCard;

