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
import { getErrorMessage } from "../../utils/get-error-message";

export default function CreateEventPage(): React.ReactElement {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDateTime = now.toISOString().slice(0, 16);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [deadline, setDeadline] = useState("");
  const [capacity, setCapacity] = useState("");
  const [handlerUuid, setHandlerUuid] = useState("");

  useEffect(() => {
    getEmployees().then(setEmployees).catch(() => {});
  }, []);

  const validate = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Event name is required";
    if (!dateTime) errors.dateTime = "Date & time is required";
    if (!postalCode.match(/^\d{6}$/)) errors.postalCode = "Postal code must be 6 digits";
    if (!deadline) errors.deadline = "Deadline is required";
    if (!capacity || Number(capacity) < 1) errors.capacity = "Capacity must be at least 1";
    if (!handlerUuid) errors.handlerUuid = "Handler is required";
    if (dateTime && deadline && new Date(deadline) >= new Date(dateTime)) {
      errors.deadline = "Deadline must be before event date";
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setSuccess(false);

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

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
      setError(getErrorMessage(err, "Failed to create event"));
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
          error={!!fieldErrors.name}
          helperText={fieldErrors.name}
        />
        <TextField
          label="Date & Time"
          type="datetime-local"
          required
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: minDateTime }}
          error={!!fieldErrors.dateTime}
          helperText={fieldErrors.dateTime}
        />
        <TextField
          label="Postal Code"
          required
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          error={!!fieldErrors.postalCode}
          helperText={fieldErrors.postalCode}
        />
        <TextField
          label="Registration Deadline"
          type="datetime-local"
          required
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: minDateTime }}
          error={!!fieldErrors.deadline}
          helperText={fieldErrors.deadline}
        />
        <TextField
          label="Capacity"
          type="number"
          required
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          inputProps={{ min: 1 }}
          error={!!fieldErrors.capacity}
          helperText={fieldErrors.capacity}
        />
        <TextField
          label="Handler"
          select
          required
          value={handlerUuid}
          onChange={(e) => setHandlerUuid(e.target.value)}
          error={!!fieldErrors.handlerUuid}
          helperText={fieldErrors.handlerUuid}
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
