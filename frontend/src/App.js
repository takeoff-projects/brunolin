// import logo from './logo.svg';
// import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
// import { useState} from "react";
import Container  from "@mui/material/Container";
import UploadPage from "./UploadPage";
import ProductsPage from "./ProductsPage";
import EtlPage from "./EtlPage";

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';

import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';

const linkStyle = {
  margin: "1rem",
  textDecoration: "none",
  color: 'white'
};

function App() {

  console.log(process.env)
  console.log(process.env.REACT_APP_API_URL)
  // const [authToken,setAuthToken] = useState("")


  return (
  <Router>
  
   <Container maxWidth="xl" disableGutters={true}>
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

          {/* <Button variant="contained" color="success"> Click to Authenticate</Button> */}

          <Stack direction="row" spacing={2}>
            <Link  to='/upload' style={linkStyle}> Upload</Link>
            <Link to='/products' style={linkStyle}> Products</Link>
            <Link to='/etl' style={linkStyle}> ETL</Link>
          </Stack>
        </Toolbar>
      </AppBar>
    </Box>

     <Switch>
          <Route path="/upload">
            <UploadPage/>
          </Route>
          <Route path="/products">
          <ProductsPage />
          </Route>
          <Route path="/etl">
          <EtlPage />
          </Route>
          <Route path="/">
          <UploadPage/>
          </Route>
      </Switch>
  

     </Container>
  </Router>
  );
}

export default App;
