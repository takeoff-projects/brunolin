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
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';


const apiUrl= 'https://'+ process.env.REACT_APP_API_URL + '/products';
const testUrl= "http://localhost:8080/files";
const categories = ["Diary","Candy","Produce","Meat","Bread","Other"];
const temps = ["Frozen","Cool","Room"];


export default function UploadForm() {
    const [category, setCategory] = useState("")
    const [temp, setTemp] = useState("")

    const [selectedFile, setSelectedFile] = useState();
	  const [isFilePicked, setIsFilePicked] = useState(false);

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

   const handleFileUpload = (event) => {
    event.preventDefault();
    const data = new FormData();
    data.append("filename", selectedFile);
    console.log(data)
    // eslint-disable-next-line no-console
    console.log({
      filename: data.get('filename'),
    });
   
    fetch(testUrl,{
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      body: data,
    }).then(response => response.json())
    .then(data => {
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });

    };

    const handleFile = (event) => {
      setSelectedFile(event.target.files[0]);
      setIsFilePicked(true);
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
              <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Upload Product
            </Button>
              </Grid>
            </Grid>

            
            <Divider>
                <Chip label="OR" />
            </Divider>
      
          </Box>

          <Box component="form" noValidate onSubmit={handleFileUpload} sx={{
                display: 'flex',
                flexDirection:'column',
                minHeight:'30vh',
                alignItems: 'center',
                justifyContent:'center'
              }}>


            <Button
              variant="contained"
              component="label"
            >
              Choose File
              <input
                type="file"
                onChange= {handleFile}
                hidden
              />
            </Button>
            {isFilePicked ? (
                <Box>
                   <Typography variant="caption" gutterBottom component="div">
                   Filename: {selectedFile.name}
                  </Typography>

                  <Typography variant="caption" gutterBottom component="div">
                  Filetype: {selectedFile.type}
                  </Typography>

                  <Typography variant="caption" gutterBottom component="div">
                  Size in bytes: {selectedFile.size}
                  </Typography>

                  <Typography variant="caption" gutterBottom component="div">
                  lastModifiedDate:{' '}
                    {selectedFile.lastModifiedDate.toLocaleDateString()}
                  </Typography>

                  <Button
                        type="submit"
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                      >
                        Upload JSON File
                  </Button>
                </Box>
              ) : (
                <Typography variant="caption" gutterBottom component="div">
                  Select a file to show details
                </Typography>
              )}
            
            </Box>
        </Box>
    </Container>
    );
}
