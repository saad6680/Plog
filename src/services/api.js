import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth Service
export const authService = {
  // Login user
  login: (email, password) => {
    return api.get(`/users?email=${email}&password=${password}`)
      .then(response => {
        if (response.data.length > 0) {
          const user = response.data[0];
          localStorage.setItem('currentUser', JSON.stringify(user));
          return { success: true, user };
        } else {
          return { success: false, message: 'Invalid credentials' };
        }
      })
      .catch(() => {
        return { success: false, message: 'Login failed' };
      });
  },

  // Register user
  register: (userData) => {
    // First check if user already exists
    return api.get(`/users?email=${userData.email}`)
      .then(response => {
        if (response.data.length > 0) {
          return { success: false, message: 'User already exists' };
        } else {
          // Create new user
          const newUser = {
            ...userData,
            id: Date.now(), // Simple ID generation
            avatar: 'https://via.placeholder.com/150',
            createdAt: new Date().toISOString()
          };
          return api.post('/users', newUser)
            .then(response => {
              localStorage.setItem('currentUser', JSON.stringify(response.data));
              return { success: true, user: response.data };
            });
        }
      })
      .catch(() => {
        return { success: false, message: 'Registration failed' };
      });
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('currentUser');
    return Promise.resolve({ success: true });
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }
};

// Posts Service
export const postsService = {
  // Get all posts
  getAllPosts: () => {
    return api.get('/posts?_sort=createdAt&_order=desc')
      .then(response => response.data)
      .catch(() => {
        console.error('Error fetching posts:');
        return [];
      });
  },

  // Get posts by user
  getPostsByUser: (userId) => {
    return api.get(`/posts?userId=${userId}&_sort=createdAt&_order=desc`)
      .then(response => response.data)
      .catch(() => {
        console.error('Error fetching user posts:');
        return [];
      });
  },

  // Create new post
  createPost: (postData) => {
    const currentUser = authService.getCurrentUser();
    const newPost = {
      ...postData,
      id: Date.now(),
      userId: currentUser.id,
      username: currentUser.username,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return api.post('/posts', newPost)
      .then(response => response.data)
      .catch(() => {
        console.error('Error creating post:');
      });
  },

  // Update post
  updatePost: (postId, postData) => {
    const updatedPost = {
      ...postData,
      updatedAt: new Date().toISOString()
    };
    return api.patch(`/posts/${postId}`, updatedPost)
      .then(response => response.data)
      .catch(() => {
        console.error('Error updating post:');
      });
  },

  // Delete post
  deletePost: (postId) => {
    return api.delete(`/posts/${postId}`)
      .then(response => response.data)
      .catch(() => {
        console.error('Error deleting post:');
      });
  }
};

// Likes Service
export const likesService = {
  // Get likes for a post
  getLikesForPost: (postId) => {
    return api.get(`/likes?postId=${postId}`)
      .then(response => response.data)
      .catch(() => {
        console.error('Error fetching likes:');
        return [];
      });
  },

  // Check if user liked a post
  hasUserLikedPost: (postId, userId) => {
    return api.get(`/likes?postId=${postId}&userId=${userId}`)
      .then(response => response.data.length > 0)
      .catch(() => {
        console.error('Error checking like status:');
        return false;
      });
  },

  // Like a post
  likePost: (postId, userId) => {
    const likeData = {
      id: Date.now(),
      postId: parseInt(postId),
      userId: parseInt(userId),
      createdAt: new Date().toISOString()
    };
    return api.post('/likes', likeData)
      .then(response => response.data)
      .catch(() => {
        console.error('Error liking post:');
      });
  },

  // Unlike a post
  unlikePost: (postId, userId) => {
    return api.get(`/likes?postId=${postId}&userId=${userId}`)
      .then(response => {
        if (response.data.length > 0) {
          const likeId = response.data[0].id;
          return api.delete(`/likes/${likeId}`);
        }
      })
      .catch(() => {
        console.error('Error unliking post:');
      });
  }
};

// Bookmarks Service
export const bookmarksService = {
  // Get bookmarks for a user
  getBookmarksForUser: (userId) => {
    return api.get(`/bookmarks?userId=${userId}`)
      .then(response => response.data)
      .catch(() => {
        console.error('Error fetching bookmarks:');
        return [];
      });
  },

  // Check if user bookmarked a post
  hasUserBookmarkedPost: (postId, userId) => {
    return api.get(`/bookmarks?postId=${postId}&userId=${userId}`)
      .then(response => response.data.length > 0)
      .catch(() => {
        console.error('Error checking bookmark status:');
        return false;
      });
  },

  // Bookmark a post
  bookmarkPost: (postId, userId) => {
    const bookmarkData = {
      id: Date.now(),
      postId: parseInt(postId),
      userId: parseInt(userId),
      createdAt: new Date().toISOString()
    };
    return api.post('/bookmarks', bookmarkData)
      .then(response => response.data)
      .catch(() => {
        console.error('Error bookmarking post:');
      });
  },

  // Remove bookmark
  removeBookmark: (postId, userId) => {
    return api.get(`/bookmarks?postId=${postId}&userId=${userId}`)
      .then(response => {
        if (response.data.length > 0) {
          const bookmarkId = response.data[0].id;
          return api.delete(`/bookmarks/${bookmarkId}`);
        }
      })
      .catch(() => {
        console.error('Error removing bookmark:');
      });
  }
};

