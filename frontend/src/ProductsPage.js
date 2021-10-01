import ProductGrid from "./ProductGrid";
import Container  from "@mui/material/Container";

function ProductsPage() {
    return (
     <Container maxWidth="xl" disableGutters={true}>
    
        <ProductGrid />
    
       </Container>
    );
  }
  
  export default ProductsPage;