import {
  Link
} from "react-router-dom";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';

import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';


  const linkStyle = {
    margin: "1rem",
    textDecoration: "none",
    color: 'white'
  };
export default function ButtonAppBar() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <LocalGroceryStoreIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
           Product Catalog
          </Typography>

          <Stack direction="row" spacing={2}>
            <Link  to='/upload' style={linkStyle}> Upload</Link>
            <Link to='/products' style={linkStyle}> Products</Link>
            <Link to='/etl' style={linkStyle}> ETL</Link>
          </Stack>
        </Toolbar>
      </AppBar>
    </Box>
  );
}