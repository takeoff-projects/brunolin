import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Container from '@mui/material/Container';

  
const apiUrl= 'https://'+ process.env.REACT_APP_API_URL + '/files';

  function Row(props) {
    const { row } = props;
    const [open, setOpen] = React.useState(false);
  
    return (
      <React.Fragment>
        <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
          <TableCell>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell component="th" scope="row">
          {row.filename}
          </TableCell>
          <TableCell align="center">{row.errors.length}</TableCell>
          <TableCell align="right"></TableCell>
          <TableCell align="right"></TableCell>
          <TableCell align="right"></TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Typography variant="h6" gutterBottom component="div">
                  Errors
                </Typography>
                <Table size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell></TableCell>
                      <TableCell align="right">Fields</TableCell>
                      <TableCell align="right"></TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {row.errors.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell component="th" scope="row">
                          {entry.id}
                        </TableCell>
                        <TableCell>{entry.line_errors[0]}</TableCell>
                        <TableCell align="right">{entry.line_errors[1]}</TableCell>
                        <TableCell align="right">{entry.line_errors[2]}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  }
  

  
//   const rows = [
//     createData('Frozen yoghurt', 159, 6.0, 24, 4.0, 3.99),
//     createData('Ice cream sandwich', 237, 9.0, 37, 4.3, 4.99),
//     createData('Eclair', 262, 16.0, 24, 6.0, 3.79),
//     createData('Cupcake', 305, 3.7, 67, 4.3, 2.5),
//     createData('Gingerbread', 356, 16.0, 49, 3.9, 1.5),
//   ];

  
function EtlTable() {
    const [etlEntries,setEtlEntries] = React.useState([])

    React.useEffect(() => {
    fetch(apiUrl).then((res => res.json())).then((data) => {
        console.log(data);
        setEtlEntries(data)});
    },[setEtlEntries])

    return (
     <Container maxWidth="md">
          <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>FileName</TableCell>
            <TableCell align="right"># of Invalid Products</TableCell>
            <TableCell align="right"></TableCell>
            <TableCell align="right"></TableCell>
            <TableCell align="right"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {etlEntries.map((row) => (
            <Row key={row.filename} row={row} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
 

    
    </Container>
    );
  }
  
  export default EtlTable;