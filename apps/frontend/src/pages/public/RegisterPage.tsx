import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import type { PublicEventDto } from "../../types/public";
import React, { useEffect, useState } from "react";
import { getOpenEvents, register } from "../../api/public";

export default function RegisterPage(): React.ReactElement {
  const [events, setEvents] = useState<PublicEventDto[]>([]);
  const [selectedUuid, setSelectedUuid] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");

  useEffect(() => {
    getOpenEvents().then(setEvents).catch(() => {});
  }, []);

  const selectedEvent = events.find((e) => e.uuid === selectedUuid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await register({
        eventUuid: selectedUuid,
        emailAddress: email,
      });
      setRegistrationNo(result.registrationNo);
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
        setError("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  if (registrationNo) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Thank You!
        </Typography>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Your registration is confirmed.
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Registration Number: <strong>{registrationNo}</strong>
        </Typography>
        <Button
          variant="outlined"
          onClick={() => {
            setRegistrationNo("");
            setEmail("");
            setSelectedUuid("");
          }}
        >
          Register for another event
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 500 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Event Registration
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          label="Select Event"
          select
          required
          value={selectedUuid}
          onChange={(e) => setSelectedUuid(e.target.value)}
        >
          {events.map((ev) => (
            <MenuItem key={ev.uuid} value={ev.uuid}>
              {ev.name}
            </MenuItem>
          ))}
        </TextField>

        {selectedEvent && (
          <Box sx={{ p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Event Details
            </Typography>
            <Typography variant="body2">
              <strong>Name:</strong> {selectedEvent.name}
            </Typography>
            <Typography variant="body2">
              <strong>Date & Time:</strong>{" "}
              {new Date(selectedEvent.dateTime).toLocaleString()}
            </Typography>
            <Typography variant="body2">
              <strong>Address:</strong> {selectedEvent.address}
            </Typography>
            <Typography variant="body2">
              <strong>Registration Deadline:</strong>{" "}
              {new Date(selectedEvent.deadline).toLocaleDateString()}
            </Typography>
          </Box>
        )}

        {selectedEvent && (
          <>
            <TextField
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : undefined}
            >
              Register
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}
