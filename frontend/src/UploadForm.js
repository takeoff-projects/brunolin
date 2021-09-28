import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import AddBoxIcon from '@mui/icons-material/AddBox';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import MenuItem from '@mui/material/MenuItem';


const apiUrl= process.env.REACT_APP_API_URL + '/products';
const categories = ["Diary","Candy","Produce","Meat","Bread","Other"];
const temps = ["Frozen","Cool","Room"];


export default function UploadForm() {
    const [category, setCategory] = useState("")
    const [temp, setTemp] = useState("")

    const handleCategoryChange = (event) => {
      setCategory(event.target.value);
    };

    const handleTempChange = (event) => {
      setTemp(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        // eslint-disable-next-line no-console
        console.log({
          name: data.get('name'),
          prodId: data.get('prodId'),
          category: category,
          temp: temp
        });
       
        fetch(apiUrl,{
          method: 'POST', // *GET, POST, PUT, DELETE, etc.
          body: JSON.stringify({
            name: data.get('name'),
            prodId: data.get('prodId'),
            category: category,
            temp: temp,
          }),
        }).then(response => response.json())
        .then(data => {
          console.log('Success:', data);
        })
        .catch((error) => {
          console.error('Error:', error);
        });

   };

    return (
        <Container maxWidth="md">
        <Box
          sx={{
            display: 'flex',
            flexDirection:'column',
            minHeight:'100vh',
            alignItems: 'center',
            justifyContent:'center'
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <AddBoxIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Product Upload
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="name"
                  name="name"
                  required
                  fullWidth
                  id="name"
                  label="Name"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="prodId"
                  label="Product ID"
                  name="prodId"
                  autoComplete="prodId"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                 <TextField
                    fullWidth
                    id="outlined-select-category"
                    select
                    label="Select Category"
                    value={category}
                    onChange={handleCategoryChange}
                    helperText="Please select a category"
                  >
                    {categories.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
              <TextField
                    fullWidth
                    id="outlined-select-temp"
                    select
                    label="Temperature Zone"
                    value={temp}
                    onChange={handleTempChange}
                    helperText="Please select a temp zone"
                  >
                    {temps.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
              </Grid>
              <Grid item xs={12}>
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Upload Product
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
              </Grid>
            </Grid>
          </Box>
        </Box>
    </Container>
    );
}
