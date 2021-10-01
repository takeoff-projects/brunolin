// import { useState} from 'react';
import Button from '@mui/material/Button';
import PropTypes from 'prop-types';

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';

import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';


const firebaseConfig = {
    apiKey: "AIzaSyD1iqVgKDMj2wMhHZ3O1aQKPubqJgGkqAk",
    authDomain: "roi-takeoff-user38.firebaseapp.com",
};

const app = initializeApp(firebaseConfig)
const creds = {email: "testuser38@example.com",password: "12345678"}
const auth = getAuth(app);


export default function LoginButton() {
    
    function handleClick() {
        signInWithEmailAndPassword(auth, creds.email, creds.password)
    .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        console.log("Sign in Successful");
        console.log(userCredential)
        
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorMessage,errorCode);
    });
       
    }

    return (
        <Container maxWidth="md">
        
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
                    </Toolbar>
                </AppBar>
                </Box>
          </Container>
      
        <Box
          sx={{
            display: 'flex',
            flexDirection:'column',
            minHeight:'100vh',
            alignItems: 'center',
            justifyContent:'center'
          }}
        >
          <Typography component="h1" variant="h5">
           Login
          </Typography>
   
          <br />
          <Button variant="contained" color="success" onClick={handleClick}>Click here to autheticate</Button>
         
        </Box>
    </Container>
    );
}

// LoginButton.propTypes = {
//     setAuthToken: PropTypes.func.isRequired
//   }
