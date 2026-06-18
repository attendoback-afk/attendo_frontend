"use client";

import { FormBuilder } from "@/components/form-builder/form-builder";
import { sessionFormSchema } from "@/validators/session-form-schema";
import type { DefaultValues } from "react-hook-form";
import type { InferType } from "yup";
import type { FieldConfig } from "@/types/form-builder";
import { DAY_OF_WEEK_LABELS, DAY_OF_WEEK_VALUES } from "@/lib/api/types";

type SessionFormValues = InferType<typeof sessionFormSchema>;

const dayOfWeekOptions = DAY_OF_WEEK_VALUES.map((value) => ({
  label: DAY_OF_WEEK_LABELS[value],
  value,
}));

function normalizeTimeValue(value: unknown) {
  if (typeof value !== "string" || !value) {
    return "";
  }

  if (/^\d{2}:\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 5);
  }

  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function buildFields({
  classOptions,
  moduleOptions,
  roomOptions,
}: {
  classOptions: { label: string; value: string }[];
  moduleOptions: { label: string; value: string }[];
  roomOptions: { label: string; value: string }[];
}): FieldConfig<SessionFormValues>[] {
  return [
    {
      name: "classId",
      label: "Class",
      type: "select",
      options: classOptions,
      placeholder: "Select class",
      section: "Session Details",
    },
    {
      name: "moduleId",
      label: "Module",
      type: "select",
      options: moduleOptions,
      placeholder: "Select module",
      section: "Session Details",
    },
    {
      name: "roomId",
      label: "Room",
      type: "select",
      options: roomOptions,
      placeholder: "Select room",
      section: "Session Details",
    },
    {
      name: "dayOfWeek",
      label: "Day of Week",
      type: "select",
      options: dayOfWeekOptions,
      placeholder: "Select day",
      section: "Schedule",
    },
    { name: "startTime", label: "Start Time", type: "time", section: "Schedule" },
    { name: "endTime", label: "End Time", type: "time", section: "Schedule" },
  ];
}

type SessionFormProps = {
  cancelHref?: string;
  defaultValues?: DefaultValues<SessionFormValues>;
  submitLabel?: string;
  submittingLabel?: string;
  onSubmit?: (values: SessionFormValues) => Promise<void> | void;
  classOptions?: { label: string; value: string }[];
  moduleOptions?: { label: string; value: string }[];
  roomOptions?: { label: string; value: string }[];
};

export function SessionForm({
  cancelHref,
  defaultValues = {
    classId: "",
    moduleId: "",
    roomId: "",
    dayOfWeek: 0,
    startTime: "",
    endTime: "",
  },
  submitLabel = "Save Session",
  submittingLabel,
  onSubmit,
  classOptions = [],
  moduleOptions = [],
  roomOptions = [],
}: SessionFormProps) {
  const normalizedDefaultValues = {
    ...defaultValues,
    startTime: normalizeTimeValue(defaultValues.startTime),
    endTime: normalizeTimeValue(defaultValues.endTime),
  };

  return (
    <FormBuilder
      fields={buildFields({ classOptions, moduleOptions, roomOptions })}
      validationSchema={sessionFormSchema}
      defaultValues={normalizedDefaultValues}
      submitLabel={submitLabel}
      submittingLabel={submittingLabel}
      cancelHref={cancelHref}
      onSubmit={async (data) => {
        await onSubmit?.(data);
      }}
    />
  );
}
