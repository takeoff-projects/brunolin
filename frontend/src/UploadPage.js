import ButtonAppBar  from "./AppBar";
import UploadForm from "./UploadForm";
import Container  from "@mui/material/Container";

function UploadPage() {
    return (
     <Container maxWidth="xl" disableGutters={true}>
       <ButtonAppBar />
      <UploadForm />
  
       </Container>
    );
  }
  
  export default UploadPage;
  