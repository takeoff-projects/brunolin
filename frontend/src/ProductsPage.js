import ButtonAppBar  from "./AppBar";
import ProductGrid from "./ProductGrid";
import Container  from "@mui/material/Container";
import Typography from "@mui/material/Typography";

function ProductsPage() {
    return (
     <Container maxWidth="xl" disableGutters={true}>
    
        <ProductGrid/>
    
       </Container>
    );
  }
  
  export default ProductsPage;