import type { TrendRowDto } from "@common/types";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEventTrend, getEvents } from "../../api/admin";
import type { AdminEventDto } from "../../types/admin";
import { getErrorMessage } from "../../utils/get-error-message";

const PAGE_SIZE = 10;

export default function EventListPage(): React.ReactElement {
  const navigate = useNavigate();
  const [events, setEvents] = useState<AdminEventDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [openOnly, setOpenOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [trendOpen, setTrendOpen] = useState(false);
  const [trendData, setTrendData] = useState<TrendRowDto[]>([]);
  const [trendLoading, setTrendLoading] = useState(false);
  const [trendEventName, setTrendEventName] = useState("");

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params: Record<string, unknown> = { page };
      if (search) params.search = search;
      if (openOnly) params.open = "true";
      const result = await getEvents(params as never);
      setEvents(result.events);
      setTotal(result.total);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load events"));
    } finally {
      setLoading(false);
    }
  }, [page, search, openOnly]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleTrend = async (event: AdminEventDto) => {
    setTrendEventName(event.name);
    setTrendOpen(true);
    setTrendLoading(true);
    try {
      const data = await getEventTrend(event.uuid);
      setTrendData(data);
    } catch {
      setTrendData([]);
    } finally {
      setTrendLoading(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5">Events</Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/admin/create-event")}
        >
          Add Event
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        <TextField
          size="small"
          placeholder="Search by name, address or handler"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          sx={{ width: 350 }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={openOnly}
              onChange={(e) => {
                setOpenOnly(e.target.checked);
                setPage(1);
              }}
            />
          }
          label="Open Event Only"
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>NAME</TableCell>
                  <TableCell>CREATED ON</TableCell>
                  <TableCell>EVENT DATE TIME</TableCell>
                  <TableCell>ADDRESS</TableCell>
                  <TableCell>REGISTRATION DEADLINE</TableCell>
                  <TableCell>HANDLER</TableCell>
                  <TableCell>CAPACITY</TableCell>
                  <TableCell>NO. OF REGISTRATION</TableCell>
                  <TableCell>STATUS</TableCell>
                  <TableCell>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.uuid}>
                    <TableCell>{event.name}</TableCell>
                    <TableCell>
                      {new Date(event.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(event.dateTime).toLocaleString()}
                    </TableCell>
                    <TableCell>{event.address}</TableCell>
                    <TableCell>
                      {new Date(event.deadline).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{event.handler.name}</TableCell>
                    <TableCell>{event.capacity}</TableCell>
                    <TableCell>{event.registrationCount}</TableCell>
                    <TableCell>{event.isOpen ? "Open" : "Closed"}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleTrend(event)}>
                        View Trend
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {events.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      No events found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Pagination
              count={totalPages || 1}
              page={page}
              onChange={(_, p) => setPage(p)}
            />
          </Box>
        </>
      )}

      <Dialog
        open={trendOpen}
        onClose={() => setTrendOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Registration Trend — {trendEventName}</DialogTitle>
        <DialogContent>
          {trendLoading ? (
            <CircularProgress />
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>New Registrations</TableCell>
                  <TableCell>Total Registrations</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trendData.map((row) => (
                  <TableRow key={row.date}>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.newRegistrationCount}</TableCell>
                    <TableCell>{row.registrationCount}</TableCell>
                  </TableRow>
                ))}
                {trendData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No trend data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
