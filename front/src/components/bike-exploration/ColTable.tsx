import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { Col } from "../../types/bike-exploration/colTypes";

interface Props {
  cols: Col[];
}

export const ColTable = ({ cols }: Props) => (
  <TableContainer component={Paper}>
    <Typography variant="h6" sx={{ p: 2 }}>
      Cols gravis ({cols.length})
    </Typography>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Col</TableCell>
          <TableCell>Altitude</TableCell>
          <TableCell>Pays</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {cols.map((c) => (
          <TableRow key={c.id}>
            <TableCell>{c.name}</TableCell>
            <TableCell>{c.elevation ? `${c.elevation} m` : "—"}</TableCell>
            <TableCell>{c.country ?? "—"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);
