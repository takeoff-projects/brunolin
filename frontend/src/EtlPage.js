import ButtonAppBar  from "./AppBar";
import ProductGrid from "./ProductGrid";
import Container  from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import EtlTable from "./EtlTable";
import Box from '@mui/material/Box';
function EtlPage() {
    return (
     <Container maxWidth="xl" disableGutters={true}>
       <ButtonAppBar />
        <Box sx={{
            display: 'flex',
            flexDirection:'column',
            minHeight:'100vh',
            alignItems: 'center',
            justifyContent:'center'
          }}>
        <EtlTable />
        </Box>
    
       </Container>
    );
  }
  
  export default EtlPage;