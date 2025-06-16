import React, { useState, useCallback, useEffect } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Avatar,
  useTheme,
  useMediaQuery,
  useScrollTrigger,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Home as HomeIcon,
  Bookmark as BookmarkIcon,
  Add as AddIcon,
  Logout as LogoutIcon,
  Login,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { styled, alpha } from '@mui/material/styles';
import debounce from 'lodash/debounce';
import logo from '../assets/Logo.png';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.common.white,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: theme.palette.common.white,
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '40ch',
    },
    '&::placeholder': {
      color: alpha(theme.palette.common.white, 0.7),
      opacity: 1,
    },
  },
}));

const LogoImage = styled('img')({
  height: '40px',
  width: 'auto',
  objectFit: 'contain',
  cursor: 'pointer',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
  },
});

const Navbar = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);


  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('search') || '';
    setSearchQuery(query);
  }, [location.search]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const debouncedSearch = useCallback(
    debounce((query) => {
      if (query.trim()) {
        navigate(`/?search=${encodeURIComponent(query)}`);
      } else {
        navigate('/');
      }
    }, 300),
    [navigate]
  );

  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      debouncedSearch.cancel();
      if (searchQuery.trim()) {
        navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      } else {
        navigate('/');
      }
    }
  };

  const handleLogout = () => {
    handleClose();
    logout();
    toast.error('Logged out successfully!', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Bookmarks', icon: <BookmarkIcon />, path: '/bookmarks' },
  ];

  return (
    <AppBar 
      position="fixed" 
      elevation={0} 
      sx={{ 
        backgroundColor: scrolled ? 'rgba(113, 122, 134, 0.9)' : '#6482AD',
        backdropFilter: scrolled ? 'blur(1px)' : 'none',
        transition: 'all 0.3s ease-in-out',
        width: '100%',
        left: 0,
        right: 0,
        '& .MuiToolbar-root': {
          minHeight: '70px',
          maxWidth: '100%',
          width: '100%',
          px: { xs: 2, sm: 4, md: 6 },
        },
      }}
    >
      <Toolbar>
        <Box
          component={RouterLink}
          to="/"
          sx={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            
          }}
        >
          <LogoImage 
            src={logo} 
            alt="Mood Logo" 
            sx={{ 
              height: '60px',
              width: '100px',
            }}
          />
          <Typography
            variant="h6"
            sx={{
              background: 'linear-gradient(to right, #ff9a9e, #fad0c4, #fad0c4, #a18cd1,rgb(44, 146, 228))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 600,
              fontSize: '1.5rem',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            Mood
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search posts..."
            value={searchQuery}
            onChange={handleSearch}
            onKeyPress={handleKeyPress}
            inputProps={{ 'aria-label': 'search' }}
          />
        </Search>

        {user ? (
          <>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
              sx={{ color: 'common.white' }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'common.white', color: '#6482AD' }}>
                {user.username?.[0]?.toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              {menuItems.map((item) => (
                <MenuItem
                  key={item.text}
                  onClick={() => {
                    handleClose();
                    navigate(item.path);
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {item.icon}
                    {item.text}
                  </Box>
                </MenuItem>
              ))}
              <MenuItem onClick={handleLogout}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LogoutIcon />
                  Logout
                </Box>
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/login')}
            startIcon={<Login />}
            sx={{
              backgroundColor: 'common.white',
              color: '#6482AD',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              },
            }}
          >
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 