"use strict";

const PIZZITY_TIME_ZONE = "America/Guayaquil";
const OPENING_MINUTES = 12 * 60 + 30;
const CLOSING_MINUTES = 20 * 60;

function getQuitoDateParts() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: PIZZITY_TIME_ZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  const weekdays = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    day: weekdays[values.weekday],
    hour: Number(values.hour),
    minute: Number(values.minute),
  };
}

function minutesToClock(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getNextOpeningText(day, currentMinutes) {
  if (day >= 1 && day <= 4) {
    if (currentMinutes < OPENING_MINUTES) {
      return `Abre hoy a las ${minutesToClock(OPENING_MINUTES)}`;
    }

    return `Abre mañana a las ${minutesToClock(OPENING_MINUTES)}`;
  }

  if (day === 5) {
    if (currentMinutes < OPENING_MINUTES) {
      return `Abre hoy a las ${minutesToClock(OPENING_MINUTES)}`;
    }

    return `Abre el lunes a las ${minutesToClock(OPENING_MINUTES)}`;
  }

  return `Abre el lunes a las ${minutesToClock(OPENING_MINUTES)}`;
}

function getBusinessStatus() {
  const now = getQuitoDateParts();
  const currentMinutes = now.hour * 60 + now.minute;
  const isWeekday = now.day >= 1 && now.day <= 5;
  const isOpen =
    isWeekday &&
    currentMinutes >= OPENING_MINUTES &&
    currentMinutes < CLOSING_MINUTES;

  if (isOpen) {
    return {
      isOpen: true,
      text: `Abierto ahora · Cierra a las ${minutesToClock(CLOSING_MINUTES)}`,
      shortText: "Abierto ahora",
    };
  }

  return {
    isOpen: false,
    text: `Cerrado · ${getNextOpeningText(now.day, currentMinutes)}`,
    shortText: "Cerrado ahora",
  };
}

function updateBusinessStatus() {
  const statusContainer = document.getElementById("business-status");
  const statusText = document.getElementById("business-status-text");

  if (!statusContainer || !statusText) {
    return;
  }

  const status = getBusinessStatus();

  statusText.textContent = status.text;
  statusContainer.classList.toggle("business-status--open", status.isOpen);
  statusContainer.classList.toggle("business-status--closed", !status.isOpen);
  statusContainer.setAttribute(
    "aria-label",
    `Estado de Pizzity Express: ${status.text}`
  );
}

function validateRequestedTime(timeValue) {
  if (!timeValue) {
    return {
      valid: false,
      message: "Selecciona una hora aproximada.",
    };
  }

  const [hour, minute] = timeValue.split(":").map(Number);
  const requestedMinutes = hour * 60 + minute;

  if (
    requestedMinutes < OPENING_MINUTES ||
    requestedMinutes > CLOSING_MINUTES
  ) {
    return {
      valid: false,
      message: "Selecciona una hora entre 12:30 y 20:00.",
    };
  }

  return {
    valid: true,
    message: "Hora válida.",
  };
}

function initializeSchedule() {
  updateBusinessStatus();

  window.setInterval(updateBusinessStatus, 60000);

  const pickupTimeInput = document.getElementById("pickup-time");

  if (pickupTimeInput) {
    pickupTimeInput.min = "12:30";
    pickupTimeInput.max = "20:00";

    pickupTimeInput.addEventListener("change", () => {
      const validation = validateRequestedTime(pickupTimeInput.value);
      pickupTimeInput.setCustomValidity(
        validation.valid ? "" : validation.message
      );
    });
  }

  console.log("Horario automático de Pizzity Express iniciado.");
}

document.addEventListener("DOMContentLoaded", initializeSchedule);
