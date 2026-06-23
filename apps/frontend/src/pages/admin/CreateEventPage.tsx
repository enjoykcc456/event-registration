import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import type { EmployeeDto } from "../../types/admin";
import React, { useEffect, useState } from "react";
import { createEvent, getEmployees } from "../../api/admin";
import { useNavigate } from "react-router-dom";

export default function CreateEventPage(): React.ReactElement {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [deadline, setDeadline] = useState("");
  const [capacity, setCapacity] = useState("");
  const [handlerUuid, setHandlerUuid] = useState("");

  useEffect(() => {
    getEmployees().then(setEmployees).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      await createEvent({
        name,
        dateTime,
        postalCode,
        deadline,
        capacity: Number(capacity),
        handlerUuid,
      });
      setSuccess(true);
      setTimeout(() => navigate("/admin"), 1500);
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { error?: string } } }).response?.data
          ?.error
      ) {
        setError(
          (err as { response: { data: { error: string } } }).response.data
            .error,
        );
      } else {
        setError("Failed to create event");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Create Event
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Event created successfully
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          label="Event Name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Date & Time"
          type="datetime-local"
          required
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Postal Code"
          required
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
        />
        <TextField
          label="Registration Deadline"
          type="datetime-local"
          required
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Capacity"
          type="number"
          required
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          inputProps={{ min: 1 }}
        />
        <TextField
          label="Handler"
          select
          required
          value={handlerUuid}
          onChange={(e) => setHandlerUuid(e.target.value)}
        >
          {employees.map((emp) => (
            <MenuItem key={emp.uuid} value={emp.uuid}>
              {emp.name}
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : undefined}
          >
            Create
          </Button>
          <Button variant="outlined" onClick={() => navigate("/admin")}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
